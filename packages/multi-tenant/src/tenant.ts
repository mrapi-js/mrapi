import { MultiTenant } from './index'
import { getUrlAndProvider } from '@mrapi/common'

export class Tenant {
  multiTenant: MultiTenant<any>

  constructor(public config: any) {
    this.multiTenant = new MultiTenant<any>({
      tenantOptions: {
        ...(config.prismaClient || {}),
      },
    })
  }

  async init() {
    const managementInfo = getUrlAndProvider(
      this.config.multiTenant.management.url,
    )
    console.log(
      `using multiple tenants, management database url: ${managementInfo.url}`,
    )
    // process.env.MANAGEMENT_URL = managementInfo.url
    // process.env.MANAGEMENT_PROVIDER = managementInfo.provider
    // await migrate.migrateManagement('up', '--create-db')

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
        // await migrate.migrateTenant('save', datasource)
        // await migrate.migrateTenant('up', datasource, '--create-db')
      }
    }
  }
}
