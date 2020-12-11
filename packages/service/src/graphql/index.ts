import type { Service } from '../'
import type { mrapi, GraphqlConfig } from '../types'
import type { app } from '@mrapi/app'
import type { graphql } from '@mrapi/graphql'

import { join } from 'path'
import { tryRequire } from '@mrapi/common'
import { applyMiddleware } from 'graphql-middleware'
import { getMeshSchema } from './mesh'

export async function makeGraphqlServices(
  serviceInstance: Service,
  getTenantIdentity: Function,
): Promise<mrapi.Endpoint[]> {
  const { config } = serviceInstance
  const { service: services } = config

  const validServicesOptions = services.filter((s) => !!s.graphql)

  if (validServicesOptions.length < 1) {
    return []
  }

  const { graphqlMiddleware }: typeof import('@mrapi/graphql') = tryRequire(
    '@mrapi/graphql',
    'Please install it manually.',
  )

  const configs: GraphqlConfig[] = []

  for (const opt of validServicesOptions) {
    const opts = opt.graphql
    if (!opts) {
      continue
    }
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
    if (opt.datasource?.provider === 'prisma') {
      plugins.push('nexus-plugin-prisma')
    }
    let schema = await getSchemaFn({
      customPath: opts.custom,
      generatedPath: opts.output,
      datasourcePath: opt.datasource?.output!,
      contextFile: opt.contextFile,
      plugins,
      mock: opt.mock,
    })
    if (opt.sources) {
      const { stitchSchemas } = tryRequire(
        '@graphql-tools/stitch',
        'Please install it manually.',
      )
      const meshSchema = await getMeshSchema(opt.sources)
      schema = stitchSchemas({
        subschemas: [schema, meshSchema],
      })
    }
    configs.push({
      options: opt,
      schema,
      playground: !!opt.graphql?.playground,
    })
  }

  let stitchingConfigs: GraphqlConfig[] = []
  let normalConfigs: GraphqlConfig[] = []

  if (config.graphql?.stitching) {
    if (typeof config.graphql.stitching === 'boolean') {
      stitchingConfigs = configs
    } else if (Array.isArray(config.graphql.stitching)) {
      for (const c of configs) {
        if (
          c.options?.name &&
          config.graphql.stitching.includes(c.options.name)
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

  let servicesToApply: GraphqlConfig[] = []

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
      subschemas: stitchingConfigs.map(({ options, schema }) => ({
        schema,
        ...(options?.datasource
          ? {
              createProxyingResolver: ({
                subschemaConfig,
                operation,
                transformedSchema,
              }) => async (
                _parent,
                _args,
                { req, res }: graphql.ContextParams,
                info,
              ) =>
                delegateToSchema({
                  schema: subschemaConfig,
                  operation,
                  context: await makeConetxt({
                    service: serviceInstance,
                    req,
                    res,
                    options,
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
        (s) => !!s.options?.graphql?.playground,
      ),
    })
  }

  servicesToApply = servicesToApply.concat(normalConfigs)

  const palygroundTabs = []
  const endpoints = []

  for (const { options, schema, playground } of servicesToApply) {
    const _schema = registerMiddlewares(options, schema)
    const endpoint =
      config.isMultiService && options ? `/graphql/${options.name}` : '/graphql'
    const middlewareOptions: graphql.Options = {
      extensions: ({ context }) => {
        return {
          ...(context.startTime
            ? { time: Date.now() - context.startTime }
            : {}),
          ...(context.tenantId ? { tenantId: context.tenantId } : {}),
        }
      },
      ...(options?.graphql || {}),
      schema: _schema,
      context: options
        ? // handle the request directly
          ({ req, res }: graphql.ContextParams) =>
            makeConetxt({
              service: serviceInstance,
              req,
              res,
              options,
              getTenantIdentity,
            })
        : // pass to `createProxyingResolver` (stitched schema has no service, because it stitched from multiple services)
          ({ req, res }: graphql.ContextParams) => ({ req, res }),
    }

    serviceInstance.app.post(endpoint, graphqlMiddleware(middlewareOptions))

    if (playground || options?.graphql?.playground) {
      palygroundTabs.push({
        name: options?.name || '',
        endpoint: endpoint,
      })
    }

    endpoints.push({
      name: options?.name || '',
      type: 'GraphQL',
      path: endpoint,
    })
  }

  if (palygroundTabs.length > 0) {
    const playgroundEndpoint = '/playground'
    makeGraphqlPlayground(serviceInstance, palygroundTabs, playgroundEndpoint)

    endpoints.push({
      name: '',
      type: 'GraphQL Playground',
      path: playgroundEndpoint,
    })
  }

  return endpoints
}

/**
 * Only supprt `POST` method
 *
 * @param {Service} serviceInstance
 * @param {any[]} tabs
 * @param {string} endpoint
 */
function makeGraphqlPlayground(
  serviceInstance: Service,
  tabs: any[],
  endpoint: string,
) {
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

  serviceInstance.app.get(endpoint, playgroundMiddleware(opts))
}

async function makeConetxt({
  service,
  req,
  res,
  options,
  getTenantIdentity,
}: {
  service: Service
  req: app.Request
  res: app.Response
  options?: mrapi.ServiceOptions
  getTenantIdentity: Function
}) {
  let datasourceClient

  const tenantId = options?.multiTenant
    ? await getTenantIdentity(req, res, options)
    : null

  if (service.datasource) {
    datasourceClient = await (options?.management
      ? service.datasource.getManagementClient()
      : service.datasource.getServiceClient(options?.name!, tenantId))
    if (!datasourceClient) {
      throw new Error(
        `Cannot get datasource client for service '${options?.name}'. ${
          options?.multiTenant
            ? `Please check if the multi-tenant identity${
                typeof options?.multiTenant?.identity === 'string'
                  ? ` '${options.multiTenant.identity}'`
                  : ''
              } has been set correctly. Received: ${tenantId}`
            : ''
        } `,
      )
    }

    // multi-tenant in one DB
    if (
      service.datasource.config.provider === 'prisma' &&
      options?.multiTenant?.mode === 'single-db'
    ) {
      const target = service.datasource.services.get(options.name)
      if (target) {
        const tenant = await target.getTenant(tenantId)
        if (tenant && tenant.provider) {
          tenant.provider.applyPrismaTenantMiddleware(tenantId)
        }
      }
    }
  }

  // get custom context
  let customContext = {}
  if (options?.contextFile) {
    const ctx = tryRequire(options.contextFile)
    if (ctx) {
      if (typeof ctx.createContext === 'function') {
        const params: mrapi.CreateContextParams = {
          req,
          res,
          service,
          prisma: datasourceClient,
        } as mrapi.CreateContextParams
        customContext = await ctx.createContext(params)
      } else if (typeof ctx.createContext === 'object') {
        customContext = ctx.createContext
      }
    }
  }

  return {
    req,
    res,
    tenantId,
    startTime: Date.now(),
    // keep `prisma` here, because paljs generation needs it
    ...(datasourceClient ? { prisma: datasourceClient } : {}),
    ...customContext,
  }
}

function registerMiddlewares(
  options: mrapi.ServiceOptions | undefined,
  schema: any,
) {
  try {
    const temp = tryRequire(`${options?.customDir}/middlewares`)
    if (temp) {
      let middlewares: any[] = []
      middlewares = middlewares.concat(Array.isArray(temp) ? temp : [temp])
      if (middlewares.length > 0) {
        schema = applyMiddleware(schema, ...middlewares)
      }
    }
    return schema
  } catch (error) {
    throw new Error('register middlerwares failed')
  }
}
