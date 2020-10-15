import type { mrapi } from './types'

import { getLogger } from '@mrapi/common'

import { createDBClientInstance } from './utils'
import Tenant, { InternalTenantOptions } from './tenant'
import { resolveOptions, tenantTableName } from './config'

export * from './config'
export { Tenant }

/**
 * ## DB
 * Agile DB service base on PrismaClient
 *
 * Usage:
 * ```
 * const db = new DB()
 * await this.db.init()
 * ```
 *
 * Note: prisma schema of management database should have these fields: name, service, database.
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
export default class DB<PrismaClient> {
  name: string
  // key = [serviceName.tenantName]
  tenants: Map<string, Tenant<PrismaClient>> = new Map()

  // main client
  protected client: PrismaClient | any
  protected defaultTenantName = 'default'

  protected migrateFn: Function
  protected TenantClient: PrismaClient

  constructor(
    protected options: mrapi.db.Options,
    protected logger?: mrapi.Logger,
  ) {
    this.logger = getLogger(logger, {
      name: 'mrapi-db',
      ...(options?.logger || {}),
    })
    this.migrateFn = options.migrateFn
    this.TenantClient = options.TenantClient

    this.options = resolveOptions(options)

    if (!this.options.name) {
      throw new Error('please set a name for DB service')
    }

    this.name = this.options.name

    if (this.options.management && this.options.ManagementClient) {
      const dbInstance = createDBClientInstance(
        this.options.ManagementClient,
        this.options.management.database,
      )
      if (!dbInstance) {
        throw new Error('create management DB client error')
      }
      if (!dbInstance[tenantTableName]) {
        throw new Error(
          `cant resolve "${tenantTableName}" table in management database "${this.options.management.database}"`,
        )
      }

      this.client = dbInstance[tenantTableName]
    }
  }

  async init() {
    // create all tenants
    for (const tenant of this.options.tenants as ({
      options: any
    } & mrapi.db.PathObject)[]) {
      await this.create({
        ...tenant,
        schema: this.options.tenantSchema,
      } as InternalTenantOptions)
    }
  }

  async create(options: InternalTenantOptions) {
    if (this.client) {
      let count = 0
      // if exist
      try {
        count = await this.client.count({
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
        this.logger.warn(
          `tenant "${this.getTenantId(options.name)}" already exist`,
        )
      } else {
        // create new record
        await this.client.create({
          data: {
            name: options.name,
            database: options.database,
            service: this.name,
          },
        })
        this.logger.debug(`tenant "${this.getTenantId(options.name)}" created`)
      }
    }

    if (this.hasTenant(options.name)) {
      throw new Error(
        `tenant "${this.getTenantId(options.name)}" already been created.`,
      )
    }

    const tenant = this.createCache(options)
    this.logger.debug(`tenant "${this.getTenantId(options.name)}" cached`)

    return tenant
  }

  async get(name?: string) {
    const tenantid = this.getTenantId(name)
    const tenant = this.tenants.get(tenantid)

    if (tenant) {
      return tenant
    }

    throw new Error(`tenant "${name}" not found. Please create one first.`)
  }

  async delete(name?: string) {
    const tenantId = this.getTenantId(name)
    if (this.client) {
      await this.client.delete({
        where: { name: tenantId },
      })
    }
    this.tenants.delete(tenantId)
    this.logger.debug(`deleted tenant "${tenantId}"`)
  }

  async disconnect(name?: string) {
    const tenantId = this.getTenantId(name)
    const tenant = this.tenants.get(tenantId)
    if (!tenant) {
      throw new Error(`tenant "${tenantId}" not conected.`)
    }
    await tenant.client.$disconnect()
  }

  async migrate(name?: string) {
    const tenant = this.get(name)
    await (await tenant).migrate()
  }

  hasTenant(name: string) {
    return this.tenants.has(this.getTenantId(name))
  }

  protected async getTenantOptions(name: string) {
    const tenantId = this.getTenantId(name)

    if (name && this.client) {
      return this.client.findFirst({
        where: { name: tenantId, service: this.name },
      })
    }

    const database = this.options.tenants[name || this.defaultTenantName]
    return {
      name: tenantId,
      service: this.name,
      database,
    }
  }

  private createCache(options: InternalTenantOptions) {
    const tenant = new Tenant<PrismaClient>(
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

    const name =
      tenantName || this.options.defaultTenant || this.defaultTenantName

    return `${this.name}.${name}`
  }
}
