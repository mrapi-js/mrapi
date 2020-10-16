import { mrapi, DAL } from '@mrapi/dal'

const options: mrapi.dal.Options = {
  // logger: {
  //   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // },
}

const app = new DAL(options)

app.start().catch((error: Error) => {
  app.logger.error(error)
})
