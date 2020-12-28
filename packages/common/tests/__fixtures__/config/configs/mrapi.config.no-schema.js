module.exports = {
  service: {
    name: 'openapi',
    schema: null,
    database: 'file:./dev.db',
    openapi: {
      dir: '/src/openapi',
      prefix: '/api',
    },
    datasource: {
      provider: 'prisma',
      schema: null,
      output: 'test-output',
    },
  },
}
