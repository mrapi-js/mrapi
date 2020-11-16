import { Service } from '@mrapi/service'

const service = new Service()

service.app.get('/', (_req, res) => {
  res.end('HW')
})

service.start().catch((err) => service.logger.error(err))
