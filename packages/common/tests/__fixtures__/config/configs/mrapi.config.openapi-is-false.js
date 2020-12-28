module.exports = {
  service: {
    name: 'openapi',
    schema: 'prisma/schema.prisma',
    database: 'file:./dev.db',
    openapi: false,
    datasource: {
      provider: 'prisma',
      schema: 'prisma/schema.prisma',
      output: 'test-output',
    },
  },
}
