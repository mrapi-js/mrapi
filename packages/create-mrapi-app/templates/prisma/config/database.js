module.exports =
  // sqlite
  {
    provider: 'sqlite',
    client: 'prisma',
    url: 'file:dev.db',
    schema: './config/schema.prisma',
    schemaOutput: './prisma/schema.prisma',
  }

// mysql
// {
//   provider: 'mysql',
//   client: 'prisma',
//   host: process.env.DB_HOST || '127.0.0.1',
//   port: process.env.DB_PORT || 3306,
//   database: process.env.DB_NAME || 'mrapi_app1',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '123456',
//   schema: './config/schema.prisma',
//   schemaOutput: './prisma/schema.prisma',
// }
