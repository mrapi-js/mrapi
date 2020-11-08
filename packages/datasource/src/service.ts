import type { ProviderName, ServiceOptions, TenantOptions } from './types'

import { Tenant } from './tenant'
import { defaults } from '@mrapi/common'
import { Management } from './management'

export class Service {
  name: string
  tenants: Map<string, Tenant> = new Map()
  isMultiTenant: boolean = false
  defaultTenantName = defaults.tenantName
  provider: any

  constructor(
    protected options: ServiceOptions,
    protected providerName: ProviderName,
    protected management?: Management,
  ) {
    this.name = options.name!
  }

  async getClient(tenantName: string = '', options = {}) {
    const tenant = await this.getTenant(tenantName || this.defaultTenantName)
    return tenant?.getClient(options)
  }

  async init() {
    if (Array.isArray(this.options.tenants)) {
      this.isMultiTenant = true
      this.defaultTenantName = this.options.defaultTenant ?? ''
      for (let tenant of this.options.tenants) {
        const instance = await this.createTenant(tenant)
        if (instance) {
          this.tenants.set(instance.name, instance)
        }
      }
    } else if (this.options.database) {
      this.isMultiTenant = false
      const instance = await this.createTenant({
        name: defaults.tenantName,
        database: this.options.database,
      })
      if (instance) {
        this.defaultTenantName = instance.name
        this.tenants.set(instance.name, instance)
      }
    }
  }

  async createTenant({ name, database }: TenantOptions) {
    if (this.tenants.has(name)) {
      // cache exist
      console.error(
        `[service ${this.name}] tenant '${name}' already exist in cache`,
      )
      return
    }

    if (this.management) {
      if (await this.management.getTenant(this.name, name)) {
        // DB record exist
        console.error(
          `[service ${this.name}] tenant '${name}' already exist in database`,
        )
        return
      }
      await this.management.createTenant(this.name, { name, database })
    }

    return new Tenant(
      {
        name,
        database,
        clientPath: this.options.clientPath,
      },
      this.providerName,
    )
  }

  async deleteTenant(name: string) {
    if (this.management) {
      await this.management.deleteTenant(this.name, name)
    }
    this.tenants.delete(name)
  }

  async getTenant(name: string) {
    const cache = this.tenants.get(name)

    if (cache) {
      return cache
    }

    if (this.management) {
      const record = await this.management.getTenant(this.name, name)

      if (!record?.database) {
        return null
      }

      // set cache
      const tenant = new Tenant(
        {
          name,
          database: record?.database,
          clientPath: this.options.clientPath,
        },
        this.providerName,
      )

      this.tenants.set(name, tenant)
      return tenant
    }

    return null
  }

  async connect() {
    for (const tenant of this.tenants.values()) {
      await tenant.connect()
    }
  }

  async disconnect() {
    for (const tenant of this.tenants.values()) {
      await tenant.disconnect()
    }
  }
}
