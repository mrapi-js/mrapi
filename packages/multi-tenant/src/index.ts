import path from 'path'
import { Tenant, requireDistant } from '@mrapi/common'

import Management from './management'
import { runDistantPrisma } from './utils'
import { datasourceProviders } from './constants'

interface MultiTenantOptions {
  useManagement?: boolean
  tenantOptions?: any
  PrismaClient?: any
  PrismaClientManagement?: any
}

interface WithMeta {
  _meta: {
    name: string
  }
}

const defaultMultiTenantOptions = {
  useManagement: true,
}

class MultiTenant<PrismaClient extends { disconnect: () => Promise<void> }> {
  ClientTenant: any

  management?: Management
  tenants: { [name: string]: PrismaClient & WithMeta }

  options: MultiTenantOptions

  constructor(options?: MultiTenantOptions) {
    this.options = { ...defaultMultiTenantOptions, ...options }

    this.loadEnv()

    this.ClientTenant = this.requireTenant()

    if (this.options.useManagement) {
      this.management = new Management({
        PrismaClient: this.options.PrismaClientManagement,
      })
    }

    this.tenants = {}
  }

  private loadEnv(): void {
    // Try loading env variables
    require('dotenv').config({
      path: path.resolve(process.cwd(), 'prisma/.env'),
    })
  }

  private requireTenant(): any {
    if (this.options.PrismaClient) {
      return this.options.PrismaClient
    }
    return requireDistant(`@prisma/client`).PrismaClient
  }

  async get(name: string, options?: any): Promise<PrismaClient & WithMeta> {
    if (this.tenants[name]) return this.tenants[name]

    if (!this.management) {
      throw new Error(
        'Cannot use .get(name) on an unknown tenant with `useManagement: false`',
      )
    }

    const tenant = await this.management.read(name)

    if (!tenant) {
      throw new Error(`The tenant with the name "${name}" does not exist`)
    }

    return await this.directGet(tenant, options)
  }

  async directGet(
    tenant: { name: string; url: string },
    options?: any,
  ): Promise<PrismaClient & WithMeta> {
    process.env.DATABASE_URL = tenant.url
    const client = new this.ClientTenant({
      ...this.options.tenantOptions,
      ...options,
    })

    client._meta = {
      name: tenant.name,
    }

    this.tenants[tenant.name] = client

    return client as PrismaClient & WithMeta
  }

  async createTenant(
    tenant: { name: string; provider: string; url: string },
    options?: any,
  ): Promise<PrismaClient & WithMeta> {
    if (!this.management) {
      throw new Error(
        'Cannot use .createTenant(tenant, options) with `useManagement: false`',
      )
    }

    if (tenant.name === 'management') {
      throw new Error(
        'The name "management" is reserved. You cannot use it for a tenant.',
      )
    }

    if (!datasourceProviders.includes(tenant.provider)) {
      throw new Error(
        `Unrecognized "${
          tenant.provider
        }" provider. Known providers: ${datasourceProviders.join(', ')}`,
      )
    }

    await this.management.create(tenant)

    await runDistantPrisma(
      'migrate up --create-db --experimental',
      tenant,
      false,
    )

    return await this.directGet(tenant, options)
  }

  async deleteTenant(name: string): Promise<Tenant> {
    if (!this.management) {
      throw new Error(
        'Cannot use .deleteTenant(name) with `useManagement: false`',
      )
    }

    if (this.tenants[name]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.tenants[name]
    }

    const tenant = await this.management.delete(name)

    await runDistantPrisma('migrate down --experimental', tenant, false)

    return tenant
  }

  async existsTenant(name: string): Promise<boolean> {
    if (!this.management) {
      throw new Error(
        'Cannot use .existsTenant(name) with `useManagement: false`',
      )
    }

    if (this.tenants[name]) return true

    return await this.management.exists(name)
  }

  async disconnect(): Promise<any[]> {
    return await Promise.all([
      ...(this.management ? [this.management.disconnect()] : []),
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      ...Object.values(this.tenants).map((t) => t.disconnect()),
    ])
  }
}

// Fix for Vercel + Next issue
// @ts-expect-error
const requirePrismaManagement = () =>
  require('.prisma-multi-tenant/management').PrismaClient

export { MultiTenant, Management, requirePrismaManagement }
export * from './constants'
export * from './utils'
