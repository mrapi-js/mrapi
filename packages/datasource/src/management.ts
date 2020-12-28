import type mrapi from '@mrapi/types'
import type { ManagementOptions } from './types'

import { join } from 'path'
import { ProviderName } from './types'
import { defaults, tryRequire } from '@mrapi/common'

export class Management {
  client: any
  provider: any
  private readonly defaultTenantModelName = 'tenant'

  constructor(
    protected options: ManagementOptions,
    protected providerName: ProviderName,
  ) {
    this.options.clientPath = options.clientPath || defaults.clientPath
  }

  getClient(options = {}) {
    if (this.client) {
      return this.client
    }

    const Provider = tryRequire(
      join(__dirname, `provider/${this.providerName}`),
    )
    if (!Provider) {
      throw new Error(`Datasource provider '${this.providerName}' not found`)
    }

    this.provider = new Provider(
      {
        database: this.options.database,
        clientPath: this.options.clientPath,
      },
      options,
    )

    this.client = this.provider.get()

    return this.client
  }

  getTenant(serviceName: string, tenantName: string = defaults.tenantName) {
    return this.getTenantModel()?.findFirst({
      where: {
        service: serviceName,
        ...(tenantName ? { name: tenantName } : {}),
      },
    })
  }

  createTenant(serviceName: string, tenant: mrapi.TenantOptions) {
    return this.getTenantModel()?.create({
      data: {
        name: tenant.name,
        service: serviceName,
        database: tenant.database,
      },
    })
  }

  deleteTenant(serviceName: string, tenantName: string) {
    return this.getTenantModel()?.delete({
      where: { service: serviceName, name: tenantName },
    })
  }

  updateTenant(serviceName: string, tenant: mrapi.TenantOptions) {
    return this.getTenantModel()?.update({
      where: {
        service: serviceName,
        name: tenant.name,
      },
      data: {
        service: serviceName,
        name: tenant.name,
        database: tenant.database,
      },
    })
  }

  async connect() {
    this.checkClient()
    return this.client.connect()
  }

  async disconnect() {
    this.checkClient()
    return this.client.disconnect()
  }

  private getTenantModel() {
    this.checkClient()

    return this.provider.model(
      this.options.tenantModelName || this.defaultTenantModelName,
    )
  }

  private checkClient() {
    if (!this.client) {
      throw new Error("Management database client hasn't been initialized yet.")
    }
  }
}
