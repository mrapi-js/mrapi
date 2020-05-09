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

  const client = new PrismaClient({
    debug: true,
    log: ['query'],
    errorFormat: 'minimal',
  })

  return client
}
