import { Context } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: Context) {
      const { reply } = ctx
      reply.send(Date.now())
    },
  },
]
