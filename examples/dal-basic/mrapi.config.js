// options for prisma client
const prismaOptions = {
  log:
    process.env.NODE_ENV === 'production'
      ? ['warn', 'error']
      : ['query', 'info', 'warn', 'error'],
  errorFormat: 'minimal', // 'pretty' | 'colorless' | 'minimal'
}

// middlewares for prisma
const prismaMiddlewares = [
  async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    console.log(
      `Prisma Middleware: Query ${params.model}.${params.action} took ${after -
        before}ms`,
    )
    return result
  },
]

module.exports = {
  dal: {
    services: [
      {
        db: {
          tenants: [
            {
              name: 'default',
              // use sqlite if database if empty
              database: '',
              // or: use mysql, pg
              // database: 'mysql://root:123456@0.0.0.0:3306/test',
            },
          ],
          prismaOptions,
          prismaMiddlewares,
        },
        graphql: {
          enable: true,
        },
        openapi: {
          enable: true,
        },
      },
    ],
  },
}
