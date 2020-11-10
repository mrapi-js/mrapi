import { Service } from '@mrapi/service'

const service = new Service()

service.start().catch((err) => service.logger.error(err))
