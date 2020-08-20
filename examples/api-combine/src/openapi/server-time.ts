import { Context } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: Context) {
      const { reply, request } = ctx
      request.log.error('123') // test custom logger
      reply.send(Date.now())
    },
  },
]
