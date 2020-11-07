module.exports = {
  app: {
    server: '',
    cache: '',
    http2: '',
    https: '',
    errorHandler: () => {},
    defaultRoute: () => {},
    logger: {},
  },
  service: {
    name: 'default',
    schema: './prisma/schema.prisma',
    database: 'file:./dev.db',
    tenants: [],
    tenantIdentity: 'mrapi-tenant-id',
    prisma: {
      schema: './prisma/schema.prisma',
      output: '',
    },
    graphql: {
      output: '',
      custom: '',
    },
    openapi: {
      output: '',
      custom: '',
    },
  },
  // or
  // service: [
  //   {
  //     name: 'default',
  //     schema: './prisma/schema.prisma',
  //     database: 'file:./dev.db',
  //     tenants: [],
  //   },
  // ],
  gateway: {
    services: [
      {
        name: '',
        url: '',
        methods: ['GET'],
      },
    ],
  },
}
