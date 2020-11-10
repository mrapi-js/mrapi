import { mrapi } from '@mrapi/service'

const config: mrapi.ConfigInput = {
  service: {
    // required if using prisma
    schema: 'prisma/schema.prisma',
    // required if using prisma
    database: 'file:./dev2.db',
  },
  logger: {
    prettyPrint: true,
  }
}

export default config
