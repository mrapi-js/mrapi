interface Options {
  database: string
  clientPath: string
}

export default class PrismaProvider {
  protected instance: any
  constructor(protected options: Options, protected prismaOptions = {}) {}

  get() {
    if (this.instance) {
      return this.instance
    }

    const { PrismaClient } = require(this.options.clientPath)
    // TODO: here is temporarily solution: set env for Prisma. It should be removed.
    // reference: https://github.com/prisma/prisma/issues/3750
    process.env.CLIENT_OUTPUT = this.options.clientPath
    process.env.DATABASE_URL = this.options.database

    this.instance = new PrismaClient({
      datasources: {
        ...this.prismaOptions,
        db: {
          url: this.options.database,
        },
      },
    })

    return this.instance
  }

  model(name: string) {
    if (!this.instance) {
      this.get()
    }

    if (!name.trim()) {
      return null
    }

    return this.instance[name.trim()]
  }

  connect() {
    if (!this.instance) {
      this.get()
    }

    return this.instance.$connect()
  }

  disconnect() {
    return this.instance && this.instance.$disconnect()
  }

  // only for multi-tenant in one DB
  applyPrismaTenantMiddleware(
    prisma: any,
    tenantId: string,
    tenantFieldName: string,
    excludeModels?: string[],
  ) {
    prisma.$use(async (params: any, next: any) => {
      let result

      if (
        !params.model ||
        (excludeModels && excludeModels.includes(params.model)) ||
        params.action === 'delete'
      ) {
        result = await next(params)
      }

      if (!result && ['create', 'update'].includes(params.action)) {
        params.args.data = {
          ...params?.args?.data,
          [tenantFieldName]: tenantId,
        }

        result = await next(params)
      }

      if (!result) {
        if (!params?.args) {
          params = { ...params, args: {} }
        }

        if (!params?.args?.where) {
          params = { ...params, args: { ...params.args, where: {} } }
        }

        if (params.action === 'findOne') {
          params.action = 'findFirst'

          params.args.where = Object.keys(params.args.where).reduce(
            (prev, next) => {
              return { ...prev, [next]: { equals: params.args.where[next] } }
            },
            {},
          )
        }

        if (params?.args?.where?.AND) {
          params.args.where = {
            AND: [
              { [tenantFieldName]: { equals: tenantId } },
              ...params.args.where.AND,
            ],
          }
        } else {
          if (
            params?.args?.where &&
            Object.keys(params?.args?.where).length > 0
          ) {
            params.args.where = {
              AND: [
                { [tenantFieldName]: { equals: tenantId } },
                ...Object.keys(params.args.where).map((key) => ({
                  [key]: params.args.where[key],
                })),
              ],
            }
          } else {
            params.args.where = {
              [tenantFieldName]: { equals: tenantId },
            }
          }
        }

        result = await next(params)
      }

      prisma._middlewares.pop()

      console.log('<--', prisma._middlewares)
      return result
    })
  }
}
