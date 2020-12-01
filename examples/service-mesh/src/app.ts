import { Service } from '@mrapi/service'

const service = new Service({
  logger: {
    prettyPrint: true,
  }
})

service.start().catch((err) => service.logger.error(err))
