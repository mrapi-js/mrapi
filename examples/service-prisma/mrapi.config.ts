import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: {
    // required if using prisma
    schema: 'prisma/schema.prisma',
    // required if using prisma
    database: 'file:./dev.db',
  },
  logger: {
    prettyPrint: true,
  }
}

export default config
