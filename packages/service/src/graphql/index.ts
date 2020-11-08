import type { Service } from '../'
import type { mrapi } from '../types'
import type { Datasource } from '@mrapi/datasource'
import type { Request, Response } from '@mrapi/app'
import type { Context, ErrorContext } from '@mrapi/graphql'

import { tryRequire } from '@mrapi/common'
import { dirname, join } from 'path'

interface GraphqlConfig {
  service?: mrapi.ServiceOptions
  schema: any
  playground?: boolean
}

export async function makeGraphqlServices({
  app,
  datasource,
  services,
  config,
  getTenantIdentity,
}: {
  app: Service
  datasource?: Datasource
  config: mrapi.ServiceConfig
  services: Array<mrapi.ServiceOptions>
  getTenantIdentity: Function
}): Promise<mrapi.Endpoint[]> {
  const validServices = services.filter((service) => !!service.graphql)

  if (validServices.length < 1) {
    return []
  }

  const { graphqlMiddleware }: typeof import('@mrapi/graphql') = tryRequire(
    '@mrapi/graphql',
    'Please install it manually.',
  )

  const configs: GraphqlConfig[] = []

  for (const service of validServices) {
    const opts = service.graphql as mrapi.GraphqlOptions
    let getSchemaFn: mrapi.GetSchemaFn
    switch (opts.generator as string) {
      case 'nexus':
      case 'type-graphql': {
        const tmp = tryRequire(join(__dirname, `./schema/${opts.generator}`))
        getSchemaFn = tmp.getSchema || tmp
        break
      }
      default:
        throw new Error(`Unknow graphql generator '${opts.generator}'`)
    }
    const plugins = []
    if (service.datasource?.provider === 'prisma') {
      plugins.push('nexus-plugin-prisma')
    }

    configs.push({
      service,
      schema: await getSchemaFn({
        customPath: opts.custom!,
        generatedPath: opts.output!,
        datasourcePath: service.datasource?.output!,
        contextDir: join(dirname(opts.output!), 'context'),
        plugins,
        mock: service.mock,
      }),
    })
  }

  let stitchingConfigs: Array<GraphqlConfig> = []
  let normalConfigs: Array<GraphqlConfig> = []

  if (!!config.graphql?.stitching) {
    if (typeof config.graphql.stitching === 'boolean') {
      stitchingConfigs = configs
    } else if (Array.isArray(config.graphql.stitching)) {
      for (const c of configs) {
        if (
          c.service?.name &&
          config.graphql.stitching.includes(c.service.name)
        ) {
          stitchingConfigs.push(c)
        } else {
          normalConfigs.push(c)
        }
      }
    }
  } else {
    normalConfigs = configs
  }

  let servicesToApply: Array<GraphqlConfig> = []

  if (stitchingConfigs.length > 0) {
    const {
      stitchSchemas,
    }: typeof import('@graphql-tools/stitch') = tryRequire(
      '@graphql-tools/stitch',
      'Please install it manually.',
    )

    const {
      delegateToSchema,
    }: typeof import('@graphql-tools/delegate') = tryRequire(
      '@graphql-tools/delegate',
      'Please install it manually.',
    )

    const unifiedSchema = stitchSchemas({
      subschemas: stitchingConfigs.map(({ service, schema }) => ({
        schema,
        ...(!!service?.datasource
          ? {
              createProxyingResolver: ({
                subschemaConfig,
                operation,
                transformedSchema,
              }) => async (_parent, _args, { req, res }: Context, info) =>
                delegateToSchema({
                  schema: subschemaConfig,
                  operation,
                  context: await makeConetxt({
                    req,
                    res,
                    service,
                    datasource,
                    getTenantIdentity,
                  }),
                  info,
                  transformedSchema,
                }),
            }
          : {}),
      })),
    })

    servicesToApply.push({
      schema: unifiedSchema,
      playground: stitchingConfigs.some(
        (s) => !!(s.service?.graphql as mrapi.GraphqlOptions)?.playground,
      ),
    })
  }

  servicesToApply = servicesToApply.concat(normalConfigs)

  const palygroundTabs = []
  const endpoints = []

  for (const { service, schema, playground } of servicesToApply) {
    const endpoint =
      config.__isMultiService && service
        ? `/graphql/${service.name}`
        : `/graphql`

    app.post(
      endpoint,
      graphqlMiddleware({
        schema,
        context: !!service
          ? // handle the request directly
            ({ req, res }: Context) =>
              makeConetxt({
                req,
                res,
                service,
                datasource,
                getTenantIdentity,
              })
          : // pass to `createProxyingResolver` (stitched schema has no service, because it stitched from multiple services)
            ({ req, res }: Context) => ({ req, res }),
        formatError: ({ error }: ErrorContext) => error,
      }),
    )

    if (playground || (service?.graphql as mrapi.GraphqlOptions)?.playground) {
      palygroundTabs.push({
        name: service?.name || '',
        endpoint: endpoint,
      })
    }

    endpoints.push({
      name: service?.name || '',
      type: 'GraphQL',
      path: endpoint,
    })
  }

  if (palygroundTabs.length > 0) {
    const playgroundEndpoint = '/playground'
    makeGraphqlPlayground(app, palygroundTabs, playgroundEndpoint)

    endpoints.push({
      name: '',
      type: 'GraphQL Playground',
      path: playgroundEndpoint,
    })
  }

  return endpoints
}

function makeGraphqlPlayground(app: Service, tabs: any[], endpoint: string) {
  const playgroundMiddleware: typeof import('graphql-playground-middleware-express').default = tryRequire(
    'graphql-playground-middleware-express',
    'Please install it manually.',
  )

  const opts =
    tabs.length === 1
      ? {
          endpoint: tabs[0].endpoint,
        }
      : {
          tabs,
        }

  app.get(endpoint, playgroundMiddleware(opts))
}

async function makeConetxt({
  req,
  res,
  datasource,
  service,
  getTenantIdentity,
}: {
  req: Request
  res: Response
  datasource?: Datasource
  service?: mrapi.ServiceOptions
  getTenantIdentity: Function
}) {
  let dbClient

  const tenantId = service?.__isMultiTenant
    ? await getTenantIdentity(req, res, service)
    : null

  if (datasource) {
    dbClient = await (service?.management
      ? datasource.getManagementClient()
      : datasource.getServiceClient(service?.name!, tenantId))
    if (!dbClient) {
      throw new Error(
        `Cannot get datasource client for service '${service?.name}'. ${
          service?.__isMultiTenant
            ? `Please check if the multi-tenant identity${
                typeof service?.tenantIdentity === 'string'
                  ? ` '${service.tenantIdentity}'`
                  : ''
              } has been set correctly. Received: ${tenantId}`
            : ''
        } `,
      )
    }
  }

  return {
    startTime: Date.now(),
    // keep `prisma` here, because paljs generation needs it
    ...(dbClient ? { prisma: dbClient } : {}),
    ...(tenantId ? { tenantId } : {}),
  }
}
