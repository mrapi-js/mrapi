import 'reflect-metadata'
import { Mrapi } from '@mrapi/core'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('in')
  const mrapi = new Mrapi({
    server: require('./server'),
    database: require('./database'),
    plugins: require('./plugins'),
  })

  mrapi
    .start()
    .then(async ({ app, address }) => {
      const client = await mrapi.multiTenant.get('client-dev')
      await action(client)
    })
    .finally(() => {
      process.exit(0)
    })
}

// const prisma = new PrismaClient()

async function action(prisma: PrismaClient) {
  const role = await prisma.role.create({
    data: {
      name: 'User',
    },
  })
  console.log({ role })

  const user = await prisma.user.create({
    data: {
      email: 'shaw@qq.com',
      name: 'shaw',
      password: '111111',
      role: {
        connect: {
          id: role.id,
        },
      },
    },
  })
  console.log({ user })
}

main().catch((e) => {
  throw e
})
