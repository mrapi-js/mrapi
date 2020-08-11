import { PrismaClient } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
}

export function createContext(options?: any): Context {
  return {
    prisma: new PrismaClient(options || {}),
  }
}
