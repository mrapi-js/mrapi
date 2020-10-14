import type { mrapi } from './types'

import { createDBClientInstance, checkFunction } from './utils'

export interface InternalTenantOptions {
  name: string
  database: string
  schema: string
  options?: any
}

export default class Tenant<PrismaClient> {
  client: PrismaClient | any
  name: string = 'default'

  constructor(
    private options: InternalTenantOptions,
    private migrateFn: Function,
    protected TenantClient: PrismaClient | any,
    protected logger?: mrapi.Logger,
  ) {
    if (options.name) {
      this.name = options.name
    }

    // TODO: check
    if (TenantClient) {
      this.client = createDBClientInstance(TenantClient, this.options.database)
    }
  }

  async migrate() {
    if (!checkFunction(this.migrateFn, 'migrateFn')) {
      return
    }

    await this.migrateFn(this.options)
    this.logger.debug(`tenant "${this.name}" migrated`)
  }

  disconnect() {
    return this.client.disconnect()
  }
}
