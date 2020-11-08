import type { Service } from '../'
import type { mrapi } from '../types'
import type { DB } from '@mrapi/db'
import type { Request, Response } from '@mrapi/app'
import type { Context, ErrorContext } from '@mrapi/graphql'

import { createSchema } from './utils'
import { tryRequire } from '@mrapi/common'

interface GraphqlConfig {
  service?: mrapi.ServiceOptions
  schema: any
  endpoint: string
}

export function makeGraphqlServices({
  app,
  db,
  services,
  middleware,
  config,
  getTenantIdentity,
  nexus,
}: {
  app: Service
  db?: DB
  middleware: any
  config: mrapi.ServiceConfig
  services: Array<mrapi.ServiceOptions>
  getTenantIdentity: Function
  nexus: typeof import('@nexus/schema')
}): Array<mrapi.Endpoint> {
  const configs = services
    .filter((service) => !!service.graphql)
    .map((service) => ({
      service,
      schema: createSchema(service, config.__isMultiService, nexus),
      endpoint: config.__isMultiService
        ? `/graphql/${service.name}`
        : `/graphql`,
    }))

  let stitchingConfigs: Array<GraphqlConfig> = []
  let normalConfigs: Array<GraphqlConfig> = []

  if (!!config.graphql?.stitching) {
    if (typeof config.graphql.stitching === 'boolean') {
      stitchingConfigs = configs
    } else if (Array.isArray(config.graphql.stitching)) {
      for (const c of configs) {
        if (
          c.service.name &&
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
        ...(!!service?.prisma
          ? {
              createProxyingResolver: ({
                subschemaConfig,
                operation,
                transformedSchema,
              }) => async (_parent, _args, { req, res }: Context, info) => {
                const context = await makeConetxt({
                  req,
                  res,
                  db,
                  service,
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
                db,
                service,
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
  db,
  service,
  getTenantIdentity,
}: {
  req: Request
  res: Response
  db?: DB
  service?: mrapi.ServiceOptions
  getTenantIdentity: Function
}) {
  let dbClient
  if (db) {
    const tenantId = await getTenantIdentity(req, res, service)
    dbClient = await (service?.management
      ? db.getManagementClient()
      : db.getServiceClient(
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

// TODO
// const startStudio =
//   typeof service.studio === 'boolean' ||
//   typeof service.studio === 'number'

// if (startStudio) {
//   const { run } = tryRequire('@mrapi/cli', `@mrapi/cli is required`)

//   const tenants = Array.isArray(service.tenants)
//     ? service.tenants
//     : service.tenants
//     ? [service.tenants]
//     : null

//   if (tenants) {
//     for (const tenant of tenants) {
//       run(
//         `prisma studio --browser=none --service=${service.name} --tenant=${tenant.name}`,
//       )
//     }
//   } else {
//     run(`prisma studio --browser=none --service=${service.name}`)
//   }
// }
