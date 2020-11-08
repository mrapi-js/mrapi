import type { ProviderName, TenantOptions } from './types'

import { join } from 'path'
import { defaults, tryRequire } from '@mrapi/common'

export class Tenant {
  name: string
  client: any
  provider: any

  constructor(
    protected options: TenantOptions,
    protected providerName: ProviderName,
  ) {
    this.name = options.name
    this.options.clientPath = options.clientPath || defaults.clientPath
  }

  async getClient(options = {}) {
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

  connect() {
    this.checkclient()
    return this.client.connect()
  }

  disconnect() {
    this.checkclient()
    return this.client.disconnect()
  }

  private checkclient() {
    if (!this.client) {
      throw new Error(`Management database client hasn't been initialized yet.`)
    }
  }
}
