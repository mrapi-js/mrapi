module.exports = {
  // sqlite
  provider: 'sqlite',
  url: 'file:dev.db',

  // mysql
  // provider: 'mysql',
  // url: 'mysql://root:123456@127.0.0.1:3306/complaint_db',

  client: 'prisma',

  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: ['query'],
  },
}
