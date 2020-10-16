import type { mrapi } from './types'

import { getLogger, merge } from '@mrapi/common'

import { getDBClientInstance } from './utils'
import { Tenant, InternalTenantOptions } from './tenant'
import { resolveOptions, defaultTenantOptions } from './config'

export * from './config'
export { Tenant }

/**
 * ## DB
 * Agile DB service base on PrismaClient
 *
 * ### Example 1:
 * ```
 * const db = new DB()
 * // Get management DB client and create all tenants
 * await db.init()
 * ```
 *
 * ### Example 2:
 * ```
 * const db = new DB()
 * const management = await db.getClient()
 * // do something with management ...
 * // Create all tenants configured in options
 * await db.createAllTenants()
 * ```
 *
 * ### Note: prisma schema of management database should have these fields: name, service, database.
 *
 * For Example:
 * ```
 *  model Tenant {
 *   id        Int      @id @default(autoincrement())
 *   name      String
 *   service   String
 *   database  String
 *
 *   \@\@index([name, service])
 * }
 * ```
 * @export
 * @class DB
 * @template PrismaClient
 */
export class DB<PrismaClient> {
  name: string
  // key = [serviceName.tenantName]
  tenants: Map<string, Tenant> = new Map()

  // main client
  client: PrismaClient | any

  protected migrateFn: Function
  protected TenantClient: PrismaClient

  constructor(
    protected options: mrapi.db.Options,
    protected logger?: mrapi.Logger,
    private useInputOptionsOnly = false,
  ) {
    this.logger = getLogger(logger, {
      ...(options?.logger || {}),
      name: 'mrapi-db',
    })
    this.migrateFn = options.migrateFn
    this.TenantClient = options.TenantClient

    if (!this.useInputOptionsOnly) {
      this.options = resolveOptions(options)
    }

    if (!this.options.name) {
      throw new Error('please set a name for DB service')
    }

    this.name = this.options.name
  }

  /**
   * Get management DB client and create all tenants
   *
   * @memberof DB
   */
  async init() {
    await this.getClient()
    await this.createAllTenants()
  }

  /**
   * Get management PrismaClient(DB client)
   *
   * @param {PrismaClient} ManagementClient PrismaClient Class
   * @param {*} options management options
   * @memberof DB
   */
  async getClient(ManagementClient?: PrismaClient, options?: any) {
    const ManagementClientClass =
      ManagementClient || this.options.ManagementClient

    if (!ManagementClientClass) {
      this.logger.debug('No ManagementClient provied')
      return
    }

    const clientOptions = merge(this.options.management || {}, options || {})

    if (!clientOptions) {
      throw new Error('canot resolve management client options')
    }

    const dbClientInstance = getDBClientInstance(
      this.options.ManagementClient,
      this.options.management.database,
    )
    if (!dbClientInstance) {
      throw new Error('create management DB client error')
    }
    if (!dbClientInstance[defaultTenantOptions.tableName]) {
      throw new Error(
        `cant resolve "${defaultTenantOptions.tableName}" table in management database "${this.options.management.database}"`,
      )
    }

    this.client = dbClientInstance
  }

  /**
   * Create all tenants configured in options
   *
   * @memberof DB
   */
  async createAllTenants() {
    for (const tenant of this.options.tenants as ({
      options: any
    } & mrapi.db.PathObject)[]) {
      await this.createTenant({
        ...tenant,
        schema: this.options.tenantSchema,
      } as InternalTenantOptions)
    }
  }

  /**
   * Check if has a specific tenant by name
   *
   * @param {string} name
   * @returns
   * @memberof DB
   */
  hasTenant(name: string) {
    return this.tenants.has(this.getTenantId(name))
  }

  /**
   * Get a specific tenant by name
   *
   * @param {string} [name]
   * @returns
   * @memberof DB
   */
  getTenant(name?: string) {
    const tenantId = this.getTenantId(name)
    const tenant = this.tenants.get(tenantId)

    if (tenant) {
      return tenant
    }

    throw new Error(
      `Cannot find tenant "${tenantId}". Please create one first.`,
    )
  }

  /**
   * Create a tenent instance
   *
   * @param {InternalTenantOptions} options
   * @returns
   * @memberof DB
   */
  async createTenant(options: InternalTenantOptions) {
    const tenantId = this.getTenantId(options.name)
    const tenantDelegate = this.getTenantDelegate()

    if (tenantDelegate) {
      let count = 0
      // if exist
      try {
        count = await tenantDelegate.count({
          where: {
            name: options.name,
            service: this.name,
          },
        })
      } catch (err) {
        if (err.message.includes('Error querying the database')) {
          this.logger.error(
            `Can not connect to database. Forgot to run "mrapi migrate" ?`,
          )
          return null
        }
        throw err
      }

      if (count > 0) {
        this.logger.warn(`tenant "${tenantId}" already exist`)
      } else {
        // create new record
        await tenantDelegate.create({
          data: {
            name: options.name,
            database: options.database,
            service: this.name,
          },
        })
        this.logger.debug(`tenant "${tenantId}" created`)
      }
    }

    if (this.hasTenant(options.name)) {
      throw new Error(`tenant "${tenantId}" already been created.`)
    }

    const tenant = this.createCache(options)
    this.logger.debug(`tenant "${tenantId}" cached`)

    return tenant
  }

  /**
   * Delete a tenant by name
   *
   * @param {string} name tenant name
   * @memberof DB
   */
  async deleteTenant(name?: string) {
    const tenantId = this.getTenantId(name)
    const tenantDelegate = this.getTenantDelegate()

    if (tenantDelegate) {
      await tenantDelegate.delete({
        where: { name: tenantId },
      })
    }
    this.tenants.delete(tenantId)
    this.logger.debug(`deleted tenant "${tenantId}"`)
  }

  /**
   * Migrate tenant DB
   *
   * @param {string} name tenant name
   * @memberof DB
   */
  async migrateTenant(name?: string) {
    const tenant = this.getTenant(name)
    await tenant.migrate()
  }

  /**
   * Disconnect the DB connection of the tenant by name
   *
   * @param {string} name tenant name
   * @memberof DB
   */
  async disconnectTenant(name?: string) {
    const tenantId = this.getTenantId(name)
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`tenant "${tenantId}" not connected.`)
    }
    await tenant.client.$disconnect()
  }

  /**
   * Disconnect the DB connections of management and ALL tenants
   *
   * @memberof DB
   */
  async disconnect() {
    await this.client.$disconnect()

    for (const tenant of this.tenants.values()) {
      await tenant.disconnect()
    }
  }

  protected async getTenantOptions(name: string) {
    const tenantId = this.getTenantId(name)
    const tenantDelegate = this.getTenantDelegate()

    if (name && tenantDelegate) {
      return tenantDelegate.findFirst({
        where: { name: tenantId, service: this.name },
      })
    }

    const database = this.options.tenants[name || defaultTenantOptions.name]
    return {
      name: tenantId,
      service: this.name,
      database,
    }
  }

  private createCache(options: InternalTenantOptions) {
    const tenant = new Tenant(
      options,
      this.migrateFn,
      this.TenantClient,
      this.logger,
    )
    this.tenants.set(this.getTenantId(tenant.name), tenant)

    return tenant
  }

  private getTenantId(tenantName?: string) {
    if (!tenantName?.trim() && !this.options.defaultTenant) {
      throw new Error(
        'name should be provided when is Multi-Tenants mode and defaultTenant not set.',
      )
    }
    const defaultName = this.options.defaultTenant || defaultTenantOptions.name
    if (!tenantName && defaultName) {
      this.logger.debug(
        `[getTenantId] ${this.name}.${tenantName} not found, use default name '${defaultName}'`,
      )
    }

    const name = tenantName || defaultName

    return `${this.name}.${name}`
  }

  private getTenantDelegate() {
    if (!this.client) {
      return null
    }

    const model = this.client[defaultTenantOptions.tableName]
    if (!model) {
      throw new Error(
        `cannot resolve "${defaultTenantOptions.tableName}" table in management database "${this.options.management.database}"`,
      )
    }

    return model
  }
}
