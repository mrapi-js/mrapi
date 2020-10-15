import Api from '@mrapi/api'

const app = new Api({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

app.server.app.addHook('preHandler', (req, reply, done) => {
  done()
})

app.start().catch((err: Error) => {
  app.logger.error(err)
})
