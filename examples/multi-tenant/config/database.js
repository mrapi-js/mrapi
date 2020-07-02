module.exports = {
  client: 'prisma',
  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  },
  multiTenant: {
    management: {
      url: 'file:management.db',
    },
    tenants: [
      {
        name: 'client-dev',
        url: 'file:dev.db',
      },
      {
        name: 'client-test',
        url: 'file:test.db',
      },
    ],
    identifier (request) {
      return request.headers['tenant-id']
    },
  },
}
