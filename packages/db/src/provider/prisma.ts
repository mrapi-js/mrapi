interface Options {
  database: string
  clientPath: string
  tenantModelName: string
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
}
