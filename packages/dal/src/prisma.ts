import { PrismaClient, PrismaClientOptions } from '@prisma/client'

export function createPrismaClient(
  options?: PrismaClientOptions,
): PrismaClient {
  return new PrismaClient(options || {})
}
