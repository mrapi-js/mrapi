import type { Request, Response } from '@mrapi/app'
import type { PrismaClient } from '.prisma/user-client'

export interface Context {
  req: Request
  res: Response
  prisma: PrismaClient
}