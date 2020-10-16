import { API } from '@mrapi/api'
import 'fastify-cookie'

const api = new API({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

const { app, logger } = api

app.addHook('preHandler', (req, reply, done) => {
  reply.setCookie('bar', 'bar', {
    path: '/',
  })
  done()
})

api.start().catch((err: Error) => logger.error(err))
