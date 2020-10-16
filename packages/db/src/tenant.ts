import type { mrapi } from './types'

import { getDBClientInstance, checkFunction } from './utils'

export interface InternalTenantOptions {
  name: string
  database: string
  schema: string
  options?: any
  prismaOptions?: mrapi.db.PrismaOptions
  prismaMiddlewares?: mrapi.db.PrismaMiddlewares
}

/**
 * DB tenant
 *
 * @export
 * @class Tenant
 */
export class Tenant {
  /**
   * Tenant name (default: "default")
   *
   * @type {string}
   * @memberof Tenant
   */
  name: string = 'default'
  /**
   * PrismaClient of management
   *
   * @type {PrismaClient}
   * @memberof Tenant
   */
  client: any
  /**
   * Database url of tenant
   *
   * @type {string}
   * @memberof Tenant
   */
  database: string

  constructor(
    private options: InternalTenantOptions,
    private migrateFn: Function,
    protected TenantClient: any,
    protected logger?: mrapi.Logger,
  ) {
    if (options.name) {
      this.name = options.name
    }
    this.database = this.options.database

    // TODO: check
    if (TenantClient) {
      this.client = getDBClientInstance(
        TenantClient,
        this.options.database,
        this.options.prismaOptions,
      )

      // apply prisma middlewares
      if (Array.isArray(this.options.prismaMiddlewares)) {
        for (const middleware of this.options.prismaMiddlewares) {
          this.client.$use(middleware)
        }
      }
    }
  }

  /**
   * Execute migrate of database
   *
   * @memberof Tenant
   */
  async migrate() {
    if (!checkFunction(this.migrateFn, 'migrateFn')) {
      return
    }

    await this.migrateFn(this.options)
    this.logger.debug(`tenant "${this.name}" migrated`)
  }

  /**
   * Disconnect database connection of tenant
   *
   * @returns
   * @memberof Tenant
   */
  disconnect() {
    return this.client.disconnect()
  }
}
