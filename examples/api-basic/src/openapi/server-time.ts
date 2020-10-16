import type { mrapi } from '@mrapi/api'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(ctx: mrapi.api.Context) {
      const { reply, request } = ctx
      request.log.error('123') // test custom logger
      reply.send(Date.now())
    },
  },
]
