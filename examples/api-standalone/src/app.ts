import Api, { mrapi } from '@mrapi/api'

const app = new Api()
let a: mrapi.ManagementObject

app.start().catch((err: Error) => {
  app.logger.error(err)
})
