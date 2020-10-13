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
  initialized: boolean
  name: string = 'default'

  constructor(
    private options: InternalTenantOptions,
    private initialize: Function,
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

  async init() {
    if (this.initialized) {
      return
    }

    if (!checkFunction(this.initialize, 'initialize')) {
      return
    }

    await this.initialize(this.options)
    this.logger.debug(`tenant client "${this.name}" initialized`)
    this.initialized = true
  }

  disconnect() {
    return this.client.disconnect()
  }
}
