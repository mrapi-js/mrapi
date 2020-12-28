module.exports = {
  service: [
    {
      name: 'openapi',
      schema: 'prisma/schema.prisma',
      database: 'file:./dev.db',
      openapi: {
        dir: '/src/openapi',
        prefix: '/api',
      },
      graphql: {
        dir: '/src/openapi',
        prefix: '/api',
      },
      datasource: {
        provider: 'prisma',
        schema: 'prisma/schema.prisma',
        output: 'test-output',
      },
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      database: 'file:./post.db',
      tenants: [
        {
          name: 'one',
          database: 'file:./post-one.db',
        },
        {
          name: 'two',
          database: 'file:./post-two.db',
        },
      ],
      multiTenant: {
        default: 'one',
      },
    },
    {
      name: 'management',
      schema: 'prisma/management/schema.prisma',
      database: 'file:./dev.db',
      openapi: {
        dir: '/src/openapi',
        prefix: '/api',
        output: 'test-output',
      },
      graphql: {
        dir: '/src/openapi',
        prefix: '/api',
        output: 'test-output',
      },
    },
  ],
}
