import type { Request, Response } from '@mrapi/app'

export const serverTimeRoutes = [
  {
    method: 'GET',
    url: '/server-time',
    async handler(_req: Request, res: Response) {
      res.send(Date.now())
    },
  },
]
