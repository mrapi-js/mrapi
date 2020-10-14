import type { mrapi } from './types'

import { getLogger } from '@mrapi/common'

import { resolveOptions } from './config'
import { createDBClientInstance } from './utils'
import Tenant, { InternalTenantOptions } from './tenant'

export * from './config'
export { Tenant }

// persistence version
export default class Base<PrismaClient> {
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
    if (options.management && options.ManagementClient) {
      this.client = createDBClientInstance(
        options.ManagementClient,
        this.options.management.database,
      )?.tenant
    }
  }

  async init() {
    // create all tenants
    for (const { name, database, options: opts } of this.options.tenants as ({
      options: any
    } & mrapi.db.PathObject)[]) {
      await this.create({
        name,
        database,
        schema: this.options.tenantSchema,
        options: opts || {},
      })
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
            service: this.options.name,
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
        this.logger.warn(`tenant "${options.name}" already exist`)
      } else {
        // create new record
        await this.client.create({
          data: {
            name: options.name,
            url: options.database,
            service: this.options.name,
          },
        })
        this.logger.debug(`tenant "${options.name}" created`)
      }
    }

    if (this.hasTenant(options.name)) {
      throw new Error(`tenant "${options.name}" already been created.`)
    }

    const tenant = this.createCache(options)

    this.logger.debug(`tenant "${options.name}" cached`)

    return tenant
  }

  async get(name?: string) {
    const tenantName = this.getTenantName(name)
    const tenant = this.tenants.get(tenantName)

    if (tenant) {
      return tenant
    }

    throw new Error(`tenant "${name}" not found. Please create one first.`)
  }

  async delete(name?: string) {
    const tenantName = this.getTenantName(name)
    if (this.client) {
      await this.client.delete({
        where: { name: tenantName },
      })
    }
    this.tenants.delete(tenantName)
    this.logger.debug(`deleted tenant "${tenantName}"`)
  }

  async disconnect(name?: string) {
    const tenantName = this.getTenantName(name)
    const tenant = this.tenants.get(tenantName)
    if (!tenant) {
      throw new Error(`tenant "${tenantName}" not conected.`)
    }
    await tenant.client.$disconnect()
  }

  async migrate(name?: string) {
    const tenant = this.get(name)
    await (await tenant).migrate()
  }

  hasTenant(name: string) {
    return this.tenants.has(name)
  }

  protected getTenantName(name?: string) {
    if (!name?.trim() && !this.options.defaultTenant) {
      throw new Error(
        'name should be provided when is Multi-Tenants mode and defaultTenant not set.',
      )
    }
    return name || this.options.defaultTenant || this.defaultTenantName
  }

  protected async getTenantOptions(name: string) {
    if (name && this.client) {
      return this.client.findOne({
        where: { name },
      })
    }

    const url = this.options.tenants[name || this.defaultTenantName]
    return {
      name,
      url,
    }
  }

  private createCache(options: InternalTenantOptions) {
    const tenant = new Tenant<PrismaClient>(
      options,
      this.migrateFn,
      this.TenantClient,
      this.logger,
    )
    this.tenants.set(tenant.name, tenant)

    return tenant
  }
}
