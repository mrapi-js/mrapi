import type { mrapi } from './types'

import { createDBClientInstance, checkFunction } from './utils'

export interface InternalTenantOptions {
  name: string
  database: string
  schema: string
  options?: any
  prismaOptions?: mrapi.db.PrismaOptions
  prismaMiddlewares?: mrapi.db.PrismaMiddlewares
}

export default class Tenant<PrismaClient> {
  client: PrismaClient | any
  name: string = 'default'

  constructor(
    private options: InternalTenantOptions,
    private migrateFn: Function,
    protected TenantClient: PrismaClient | any,
    protected logger?: mrapi.Logger,
  ) {
    if (options.name) {
      this.name = options.name
    }

    // TODO: check
    if (TenantClient) {
      this.client = createDBClientInstance(
        TenantClient as PrismaClient,
        this.options.database,
        {
          errorFormat: 'minimal', // 'pretty' | 'colorless' | 'minimal'
          log: ['warn', 'error'], // ['query', 'info', 'warn', 'error']
          ...(this.options.prismaOptions || {}),
        },
      )

      // apply prisma middlewares
      if (Array.isArray(this.options.prismaMiddlewares)) {
        for (const middleware of this.options.prismaMiddlewares) {
          this.client.$use(middleware)
        }
      }
    }
  }

  async migrate() {
    if (!checkFunction(this.migrateFn, 'migrateFn')) {
      return
    }

    await this.migrateFn(this.options)
    this.logger.debug(`tenant "${this.name}" migrated`)
  }

  disconnect() {
    return this.client.disconnect()
  }
}
