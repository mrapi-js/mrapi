import { Context } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: Context) {
      const { reply, prisma } = ctx
      const users = await prisma.user.findMany()
      reply.send(users)
    },
  },
]
