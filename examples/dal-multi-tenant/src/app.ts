import DAL from '@mrapi/dal'

const app = new DAL({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

app.start().catch((error: Error) => {
  app.logger.error(error)
})
