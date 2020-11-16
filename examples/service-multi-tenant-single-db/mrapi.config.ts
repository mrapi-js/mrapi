import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: {
    name: 'user',
    // schema: 'prisma/schema.prisma',
    database: 'file:./user.db',
    datasource: {
      provider: 'prisma',
      schema: 'prisma/schema.prisma',
    },
    tenants: [
      {
        name: 'one',
      },
      {
        name: 'two',
      },
    ],
    multiTenant: {
      mode: 'single-db',
      default: 'one',
    },
  },
  // graphql: {
  //   stitching: ['user', 'post'],
  // },
  logger: {
    prettyPrint: true,
  },
}

export default config
