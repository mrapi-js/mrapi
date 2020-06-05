import { requireFromProject } from './utils/tools'
import { checkPrismaClient } from './utils/prisma'
import { generate } from './utils/prisma'
import { log } from './utils/logger'

export const getDBClient = async ({ database, server }: any) => {
  // load '@prisma/client' from user's project folder
  const clientValid = checkPrismaClient()
  if (!clientValid) {
    log.warn(`prisma client isn't ready. generate now...`)
    await generate({ database, server })
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
  return new PrismaClient({
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
  })
}
