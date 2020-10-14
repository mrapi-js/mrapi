exports.default = {
  api: {
    schemaNames: ['blog'],
    server: {
      type: 'combined',
    },
    graphql: {
      dir: '/src/graphql',
    },
    openapi: {
      dir: '/src/openapi',
    },
  },
  dal: {
    services: [
      {
        name: 'blog',
        db: {
          tenants: {
            // empty: use default name from './config/*.prisma'
            dev: 'mysql://root:123456@0.0.0.0:3306/blog',
          },
        },
      },
    ],
  },
}
