import type { DBOptions, ServiceOptions } from './types'

import { Service } from './service'
import { Management } from './management'
import { ensureArray } from '@mrapi/common'

export * from './types'

export class DB {
  management?: Management
  services: Map<string, Service> = new Map()

  constructor(public config: DBOptions) {}

  async init() {
    if (!!this.config.management) {
      await this.initManagement()
    }

    if (this.config.services) {
      await this.initServices()
    }
  }

  private initManagement() {
    this.management = new Management(
      this.config.management!,
      this.config.provider,
    )

    this.getManagementClient()
  }

  private async initServices() {
    const services = ensureArray<ServiceOptions>(this.config.services)
    for (const service of services) {
      const exist = await this.services.get(service.name!)
      if (!exist) {
        const instance = new Service(
          service,
          this.config.provider,
          this.management,
        )
        await instance.init()
        this.services.set(service.name!, instance)
      }
    }
  }

  getManagementClient() {
    return this.management?.getClient()
  }

  getServiceClient(name: string, tenantName?: string) {
    return this.services.get(name)?.getClient(tenantName)
  }

  async disconnect() {
    await this.management?.disconnect()

    for (const service of this.services.values()) {
      await service.disconnect()
    }
  }
}
