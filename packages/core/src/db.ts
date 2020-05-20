import { requireFromProject, checkPrismaClient } from './utils/tools'
import { generate } from './utils/prisma'

export const getDBClient = async ({ database, server }: any) => {
  // load '@prisma/client' from user's project folder
  const clientValid = checkPrismaClient()
  if (!clientValid) {
    console.log(`prisma client isn't ready. generate now...`)
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
    console.log(`[mrapi] connected to ${datasources.db}`)
  }
  return new PrismaClient({
    ...(database.prismaClient || {}),
    ...datasources,
  })
}
