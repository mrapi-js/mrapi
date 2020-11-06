import { Service } from '@mrapi/service'

const service = new Service({
  app: {
    logger: {
      prettyPrint: true,
    },
  },
})

service
  .get('/', (_req, res) => {
    res.end('HW')
  })
  .start()
  .catch((err) => service.logger.error(err))
