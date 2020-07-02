module.exports = {
  url: 'file:dev.db',
  client: 'prisma',
  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  },
  // multiTenant: {
  //   management: {
  //     provider: 'sqlite',
  //     url: 'file:management.db',
  //   },
  //   identifier: {
  //     headers: 'tenantId',
  //   },
  // },
}
