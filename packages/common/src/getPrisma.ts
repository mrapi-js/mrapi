export default function getPrisma(prismaClient: any) {
  if (!prismaClient) {
    throw new Error(`[/${prismaClient}] - PrismaClient was not found.`)
  }
  return typeof prismaClient === 'string' ? require(prismaClient) : prismaClient
}

export function getPrismaClient(prismaClient: any) {
  return getPrisma(prismaClient).PrismaClient
}

export function getPrismaDmmf(prismaClient: any) {
  return getPrisma(prismaClient).dmmf
}
