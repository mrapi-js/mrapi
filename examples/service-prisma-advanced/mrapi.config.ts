import { mrapi } from '@mrapi/service'

const config: mrapi.ConfigInput = {
  service: [
    {
      name: 'user',
      datasource: {
        provider: 'prisma',
        schema: 'prisma/user/schema.prisma',
      },
      tenants: [
        {
          name: 'one',
          // relative to schema
          database: 'file:./user-one.db',
        },
        {
          name: 'two',
          // relative to schema
          database: 'file:./user-two.db',
        },
      ],
      defaultTenant: 'one',
      openapi: true,
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      // relative to schema
      database: 'file:./post.db',
    },
    {
      name: 'management',
      schema: 'prisma/management/schema.prisma',
      // relative to schema
      database: 'file:./dev.db',
      management: true,
    },
  ],
  graphql: {
    stitching: ['user', 'post'],
  },
  logger: {
    prettyPrint: true,
  },
}

export default config
