import { DBClient } from './types'
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
  // const multiTenant = new MultiTenant<PrismaClient>()
  // const prisma = await multiTenant.get(name)

  // return {
  //   client: prisma as PrismaClient,
  //   context: { prisma },
  // } as DBClient

  const client = new PrismaClient({
    debug: true,
    log: ['query'],
    errorFormat: 'minimal',
  })

  // return {
  //   client,
  //   context: {
  //     prisma: client,
  //   },
  // } as DBClient

  return client
}
