import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // const user1 = await prisma.user.create({
  //   data: {
  //     email: 'alice@prisma.io',
  //     name: 'Alice',
  //     password: '111111',
  //   },
  // })
  // console.log({ user1 })
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.disconnect()
  })
