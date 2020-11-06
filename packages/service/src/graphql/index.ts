import type { Service } from '../'
import type { mrapi } from '../types'
import type { DB } from '@mrapi/db'
import type { Request, Response } from '@mrapi/app'
import type { Context, ErrorContext } from '@mrapi/graphql'

import { createSchema } from './utils'

export function makeGraphql({
  app,
  prisma,
  service,
  middleware,
  config,
  getTenantIdentity,
  nexus,
}: {
  app: Service
  prisma?: DB
  middleware: any
  config: mrapi.ServiceConfig
  service: mrapi.ServiceOptions
  getTenantIdentity: Function
  nexus: typeof import('@nexus/schema')
}) {
  const schema = createSchema(service, config, nexus)
  const endpoint = config.__isMultiService
    ? `/graphql/${service.name}`
    : `/graphql`

  app.post(
    endpoint,
    middleware({
      schema,
      context: async ({ req, res }: Context) => {
        return makeConetxt({
          req,
          res,
          prisma,
          service,
          getTenantIdentity,
        })
      },
      formatError: ({ error }: ErrorContext) => error,
    }),
  )

  return {
    endpoint,
  }
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
  prisma,
  service,
  getTenantIdentity,
}: {
  req: Request
  res: Response
  prisma?: DB
  service: mrapi.ServiceOptions
  getTenantIdentity: Function
}) {
  let prismaClient
  if (prisma) {
    const tenantId = await getTenantIdentity(req, res, service)
    prismaClient = await prisma.getServiceClient(service.name!, tenantId)
    if (!prismaClient) {
      throw new Error(
        `Please check if the multi-tenant identity${
          typeof service.tenantIdentity === 'string'
            ? ` '${service.tenantIdentity}'`
            : ''
        } has been set correctly. Received: ${tenantId}`,
      )
    }
  }

  return {
    startTime: Date.now(),
    ...(prismaClient ? { prisma: prismaClient } : {}),
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
