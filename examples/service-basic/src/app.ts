import { Service } from '@mrapi/service'

const service = new Service({
  app: {
    logger: {
      prettyPrint: true,
    },
  },
})

service.start().catch((err) => service.logger.error(err))
