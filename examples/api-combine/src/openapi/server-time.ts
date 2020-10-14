import type { mrapi } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: mrapi.api.Context) {
      const { reply, prisma } = ctx
      const users = await prisma.user.findMany()
      reply.send(users)
    },
  },
]
