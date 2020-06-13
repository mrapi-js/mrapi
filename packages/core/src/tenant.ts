import { MultiTenant } from 'prisma-multi-tenant'
import { PrismaClient as PrismaClientType } from '@prisma/client'
import migrate from 'prisma-multi-tenant/build/cli/commands/migrate'
import { getUrlAndProvider } from './utils/prisma'
import { log } from './utils/logger'

export class Tenant {
  multiTenant: MultiTenant<PrismaClientType>

  constructor(public config) {
    this.multiTenant = new MultiTenant<PrismaClientType>({
      tenantOptions: {
        ...(config.prismaClient || {}),
      },
    })
  }

  async init() {
    const managementInfo = getUrlAndProvider(
      this.config.multiTenant.management.url,
    )
    log.info(
      `[mrapi] using multiple tenants, management database url: ${managementInfo.url}`,
    )
    process.env.MANAGEMENT_URL = managementInfo.url
    process.env.MANAGEMENT_PROVIDER = managementInfo.provider
    await migrate.migrateManagement('up', '--create-db')

    for (let tenant of this.config.multiTenant.tenants) {
      const name = tenant.name.trim()
      if (!(await this.multiTenant.existsTenant(name))) {
        const { url, provider } = getUrlAndProvider(tenant.url)
        const datasource = {
          name,
          url,
          provider,
        }
        await this.multiTenant.createTenant(datasource, {
          datasources: { db: tenant.url },
        })
        await migrate.migrateTenant('save', datasource)
        await migrate.migrateTenant('up', datasource, '--create-db')
      }
    }
  }
}
