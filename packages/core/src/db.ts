import { requireFromProject } from './utils/tools'
import { checkPrismaClient } from './utils/prisma'
import { generate } from './utils/prisma'
import { log } from './utils/logger'
import execa, { Options as ExecaOptions } from 'execa'

import { MultiTenant } from 'prisma-multi-tenant'
import { PrismaClient as PrismaClientType } from '@prisma/client'
import migrate from 'prisma-multi-tenant/build/cli/commands/migrate'

export const getDBClient = async ({ database, server, plugins }: any) => {
  // load '@prisma/client' from user's project folder
  const clientValid = checkPrismaClient()
  if (!clientValid) {
    log.warn(`prisma client isn't ready. generate now...`)
    await generate({ database, server, plugins })
  }
  const { PrismaClient } = requireFromProject('@prisma/client')
  const datasources = process.env.DB_URL
    ? {
        db: process.env.DB_URL,
      }
    : database.url
    ? {
        db: database.url,
      }
    : {}
  if (Object.keys(datasources).length > 0) {
    log.info(`[mrapi] connected to ${datasources.db}`)
  }
  const clientOptions = {
    ...(database.prismaClient || {}),
    ...datasources,
    __internal: {
      hooks: {
        beforeRequest(opts) {
          if (!opts.document || opts.document.type !== 'query') {
            return
          }
          // fix prisma query bug: skip: -1,  PANIC: called `Result::unwrap() TryFromIntError`
          const children = opts.document.children
          for (let child of children) {
            const args = child.args.args
            for (let arg of args) {
              if (['skip', 'first', 'last'].includes(arg.key)) {
                if (arg.value < 0) {
                  throw new Error(
                    `argument '${arg.key}' must be a positive integer`,
                  )
                }
              }
            }
          }
        },
      },
    },
  }

  if (database.multiTenant) {
    log.info(`[mrapi] using multiple tenants`)
    process.env.MANAGEMENT_PROVIDER = database.provider
    process.env.MANAGEMENT_URL = database.multiTenant.management?.url
    // const migrate = require('../../../node_modules/prisma-multi-tenant/build/cli/commands/migrate.js')
    //   .default

    await migrate.migrateManagement('up', '--create-db')

    // const managementDatasource = process.env.MANAGEMENT_URL
    //   ? {
    //       db: process.env.MANAGEMENT_URL,
    //     }
    //   : database.multiTenant.management?.url
    //   ? {
    //       db: database.multiTenant.management.url,
    //     }
    //   : {}
    const multiTenant = new MultiTenant<PrismaClientType>({
      tenantOptions: clientOptions,
      PrismaClientManagement: new PrismaClient({
        ...(database.prismaClient || {}),
        // ...managementDatasource,
      }),
    })
    return { multiTenant }
  }

  log.info(`[mrapi] using single prisma client`)

  return {
    prismaClient: new PrismaClient(clientOptions),
  }
}
