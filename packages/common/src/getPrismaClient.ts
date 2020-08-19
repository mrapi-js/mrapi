export default function getPrismaClient(prismaClient: any) {
  if (!prismaClient) {
    throw new Error(`[/${prismaClient}] - PrismaClient was not found.`)
  }
  return typeof prismaClient === 'string'
    ? require(prismaClient).PrismaClient
    : prismaClient
}
