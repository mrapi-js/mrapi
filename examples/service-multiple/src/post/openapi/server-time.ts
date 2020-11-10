import type { mrapi } from '@mrapi/service'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(_req: mrapi.Request, res: mrapi.Response) {
      res.send(Date.now())
    },
  },
]
