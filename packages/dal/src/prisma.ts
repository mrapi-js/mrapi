import { PrismaClient } from '@prisma/client'

export function createPrismaClient(options?: any): PrismaClient {
  return new PrismaClient(options)
}
