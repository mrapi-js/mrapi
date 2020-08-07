import { PrismaClient, PrismaClientOptions } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
}

export function createContext(options?: PrismaClientOptions): Context {
  return {
    prisma: new PrismaClient(options || {}),
  }
}
