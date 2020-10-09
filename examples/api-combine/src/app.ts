import Api from '@mrapi/api'

const app = new Api()

app.start().catch((err: Error) => {
  app.logger.error(err)
})
