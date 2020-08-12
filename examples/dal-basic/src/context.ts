import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default class Context {
  prisma = prisma
}
