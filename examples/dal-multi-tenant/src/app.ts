import DAL from '@mrapi/dal'

const app = new DAL({
  logger: {
    level: 'info',
  },
})

app.start().catch((error: Error) => {
  app.logger.error(error)
})
