module.exports = {
  service: {
    // name: 'management',
    schema: 'prisma/management/schema.prisma',
    database: 'file:./dev.db',
    openapi: {
      dir: '/src/openapi',
      prefix: '/api',
      output: 'test-output',
    },
  },
}
