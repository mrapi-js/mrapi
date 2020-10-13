import type { mrapi } from './types'

import { merge, getLogger } from '@mrapi/common'

import Server from './server'
import Service from './service'
import { resolveOptions } from './config'

export * from './types'

export * from './helpers'

export default class DAL {
  public server: Server
  private readonly services: Map<string, Service> = new Map()

  constructor(
    public options?: mrapi.dal.Options,
    public logger?: mrapi.Logger,
  ) {
    this.logger = getLogger(logger, {
      name: 'mrapi-dal',
      ...(options?.logger || {}),
    })
    this.options = resolveOptions(options)
  }

  /**
   * Add service to existing server
   *
   * Note: If "name" already exists, Please call "dal.removeService" first
   *
   */
  async addService(option: mrapi.dal.ServiceOptions) {
    if (this.services.get(option.name)) {
      this.logger.error(`Service "${option.name}" already exist`)
      return null
    }

    const service = new Service(option, this.logger)
    await service.init()

    if (this.server) {
      this.server.addRoute({
        ...service.options,
        ...this.options.server,
      })
    }

    this.services.set(option.name, service)

    return service
  }

  /**
   * Remove service from server
   *
   */
  removeService(name: string): boolean {
    const service = this.services.get(name)
    if (!service) {
      this.logger.error(`Service "${name}" not exist`)
      return false
    }

    // remove route
    this.server.removeRoute(name)
    // remove service
    service.release()
    this.services.delete(name)

    return true
  }

  /**
   * Return server has service
   */
  hasService(name: string) {
    return this.services.has(name)
  }

  async addServices(options?: mrapi.dal.ServiceOptions[]) {
    const opts = options || this.options.services
    if (!Array.isArray(opts)) {
      return []
    }

    const promises = opts.map(async (opt) => await this.addService(opt))

    return Promise.all(promises)
  }

  /**
   * Get DB client
   *
   */
  getDBClient = async (serviceName: string, tenantName?: string) => {
    this.logger.debug(
      `getDBClient => serviceName: ${serviceName}, tenantName: ${tenantName}`,
    )
    const service = this.services.get(serviceName)
    return service.getTenantClient(tenantName).catch((err: Error) => {
      // In the event of a multi-tenant exception, the document connection is guaranteed to be properly accessed.
      // if (this.options.throwOriginalError) {
      //   throw err
      // }`
      this.logger.error(err)
      const message = `Check to see if a multi-tenant identity  has been added to the "Request Headers".`
      this.logger.error(`Tips: ${message}`)
      throw new Error(message)
    })
  }

  async getSchemas() {
    const services = await this.addServices()
    return services.map((service: Service) => service.options.graphql.schema)
  }

  /**
   * Start server
   *
   * Note: When service is initialized, the default port configuration is logged.
   *
   */
  async start(options?: mrapi.dal.ServerOptions) {
    this.options.server = merge(this.options.server, options || {})
    if (!this.server) {
      this.server = new Server(
        this.options.server,
        this.getDBClient,
        this.logger,
      )
    }
    this.server.start(options)
    await this.addServices()
  }

  /**
   * Stop server
   *
   */
  async stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }
    this.server.stop()
  }
}
