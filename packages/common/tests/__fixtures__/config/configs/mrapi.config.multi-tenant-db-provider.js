module.exports = {
  service: {
    name: 'openapi',
    schema: 'prisma/schema.prisma',
    database: 'file:./dev.db',
    openapi: {
      dir: '/src/openapi',
      prefix: '/api',
    },
    datasource: {
      provider: 'prisma',
      schema: 'prisma/schema.prisma',
      output: 'test-output',
    },
  },
}
