import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: {
    name: 'user',
    // schema: 'prisma/schema.prisma',
    database: 'file:./use.db',
    datasource: {
      provider: 'prisma',
      schema: 'prisma/schema.prisma',
      tenantMode: 'one-db'
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
