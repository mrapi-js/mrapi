import type { mrapi } from './types'
import type { Express } from 'express'

import { merge, getLogger } from '@mrapi/common'

import Server from './server'
import Service from './service'
import { defaults, resolveOptions } from './config'

export * from './types'

export * from './helpers'

/**
 * ## DAL
 * Data Access Layer Applacation
 *
 * @example
 * ```
 * const app = new DAL()
 *
 * // start the dal server
 * app.start().catch((error: Error) => {
 *   app.logger.error(error)
 * })
 * ```
 *
 *
 */
export class DAL {
  /**
   * Equals to server's app, only available after dal.start()
   *
   * @type {Express}
   * @memberof DAL
   */
  app: Express
  /**
   * DAL server
   *
   * @type {Server}
   * @memberof DAL
   */
  server: Server
  private readonly services: Map<string, Service> = new Map()

  constructor(
    public options?: mrapi.dal.Options,
    public logger?: mrapi.Logger,
  ) {
    this.logger = getLogger(logger, {
      ...(options?.logger || {}),
      name: 'mrapi-dal',
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
      service.address = this.server.addRoute({
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
    const services: Service[] = []
    if (!Array.isArray(opts)) {
      return services
    }

    for (const opt of opts) {
      const service = await this.addService(opt)
      services.push(service)
    }

    return services
  }

  /**
   * Get DB client
   *
   */
  getDBClient: mrapi.dal.GetDBClientFn = async (
    serviceName: string,
    tenantName?: string,
  ) => {
    const name = serviceName || defaults.serviceName
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`service "${name}" not found`)
    }
    return service.getTenantClient(tenantName).catch((err: Error) => {
      this.logger.error(err)
      const message =
        err.message +
        ` Please check if the multi-tenant identity "${this.options.server.tenantIdentity}" has been set in the request headers.`
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
      this.app = this.server.app
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
