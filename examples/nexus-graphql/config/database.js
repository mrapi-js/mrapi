module.exports = {
  provider: 'mysql',
  url: process.env.DB_URL ||'mysql://root:123456@127.0.0.1:3306/marapi_test',
  client: 'prisma',
  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  },
}
