import { API } from '@mrapi/api'

const api = new API({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

const { app, logger } = api

app.addHook('preHandler', (req, reply, done) => {
  done()
})

api
  .start()
  .then(({ address }) => console.log(address))
  .catch((err: Error) => logger.error(err))
