import { Service } from '@mrapi/service'

const service = new Service({
  app: {
    logger: {
      prettyPrint: true,
    },
  },
  logEndpoints: false
})

service.start()
