import { mrapi, DAL } from '@mrapi/dal'

const options: mrapi.dal.Options = {
  // logger: {
  //   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // },
}

const dal = new DAL(options)

const { logger } = dal

dal.start().catch((error: Error) => {
  logger.error(error)
})
