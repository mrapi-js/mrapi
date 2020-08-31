import { Context } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: Context) {
      const { reply, prisema } = ctx
      const users = await prisema.user.findMany()
      reply.send(users)
    },
  },
]
