import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const role = await prisma.role.create({
    data: {
      name: 'Normal',
    },
  })
  console.log({ role })

  const user = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      password: '111111',
      Role: {
        connect: {
          id: role.id,
        },
      },
    },
  })
  console.log({ user })
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.disconnect()
  })
