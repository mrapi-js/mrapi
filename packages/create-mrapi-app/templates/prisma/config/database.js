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
    __internal: {
      hooks: {
        beforeRequest (opts) {
          if (!opts.document || opts.document.type !== 'query') {
            return
          }
          const children = opts.document.children
          for (let child of children) {
            const args = child.args.args
            for (let arg of args) {
              if (['skip', 'first', 'last'].includes(arg.key)) {
                if (arg.value < 0) {
                  throw new Error(
                    `argument '${arg.key}' must be a positive integer`,
                  )
                }
              }
            }
          }
        },
      },
    },
  },
}
