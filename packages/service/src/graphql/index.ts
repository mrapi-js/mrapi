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
  endpoint: string
}

export async function makeGraphqlServices({
  app,
  datasource,
  services,
  middleware,
  config,
  getTenantIdentity,
}: {
  app: Service
  datasource?: Datasource
  middleware: any
  config: mrapi.ServiceConfig
  services: Array<mrapi.ServiceOptions>
  getTenantIdentity: Function
}): Promise<mrapi.Endpoint[]> {
  const validServices = services.filter((service) => !!service.graphql)
  const configs: GraphqlConfig[] = []

  for (const service of validServices) {
    const opts = service.graphql as mrapi.GraphqlOptions
    let getSchemaFn: mrapi.GetSchemaFn
    switch (opts.schemaProvider as string) {
      case 'nexus':
      case 'type-graphql': {
        const tmp = tryRequire(
          join(__dirname, `./schema/${opts.schemaProvider}`),
        )
        getSchemaFn = tmp.getSchema || tmp
        break
      }
      default:
        throw new Error(`Unknow SchemaProvider '${opts.schemaProvider}'`)
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
      endpoint: config.__isMultiService
        ? `/graphql/${service.name}`
        : `/graphql`,
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
              }) => async (_parent, _args, { req, res }: Context, info) => {
                const context = await makeConetxt({
                  req,
                  res,
                  service,
                  datasource,
                  getTenantIdentity,
                })
                return delegateToSchema({
                  schema: subschemaConfig,
                  operation,
                  context,
                  info,
                  transformedSchema,
                })
              },
            }
          : {}),
      })),
    })

    servicesToApply.push({
      schema: unifiedSchema,
      endpoint: '/graphql',
    })
  }

  servicesToApply = servicesToApply.concat(normalConfigs)

  for (const { service, schema, endpoint } of servicesToApply) {
    app.post(
      endpoint,
      middleware({
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
          : // pass to `createProxyingResolver`
            ({ req, res }: Context) => ({ req, res }),
        formatError: ({ error }: ErrorContext) => error,
      }),
    )
  }

  return servicesToApply.map(({ service, endpoint }) => ({
    name: service?.name || 'united',
    type: 'GraphQL',
    path: endpoint,
  }))
}

export function makeGraphqlPlayground(
  app: Service,
  middleware: any,
  tabs: any[],
) {
  const endpoint = '/playground'

  app.get(
    endpoint,
    middleware({
      ...(Array.isArray(tabs) && tabs.length > 0
        ? { tabs }
        : {
            endpoint: '/graphql',
          }),
    }),
  )

  return {
    endpoint,
  }
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
  if (datasource) {
    const tenantId = await getTenantIdentity(req, res, service)
    dbClient = await (service?.management
      ? datasource.getManagementClient()
      : datasource.getServiceClient(
          service?.name!,
          service?.__isMultiTenant ? tenantId : null,
        ))
    if (!dbClient) {
      throw new Error(
        `Please check if the multi-tenant identity${
          typeof service?.tenantIdentity === 'string'
            ? ` '${service.tenantIdentity}'`
            : ''
        } has been set correctly. Received: ${tenantId}`,
      )
    }
  }

  return {
    startTime: Date.now(),
    // keep `prisma` here, because paljs generation needs it
    ...(dbClient ? { prisma: dbClient } : {}),
  }
}
