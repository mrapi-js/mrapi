import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // const user1 = await prisma.user.create({
  //   data: {
  //     email: 'alice@prisma.io',
  //     name: 'Alice',
  //     posts: {
  //       create: {
  //         title: 'Watch the talks from Prisma Day 2019',
  //         content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
  //         published: true,
  //       },
  //     },
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
