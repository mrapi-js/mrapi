import type { mrapi, GatewayServiceOptions, AxiosInstance } from './types'

import Proxy from 'fast-proxy'
import { App } from '@mrapi/app'
import { AddressInfo } from 'net'
import { resolveConfig, defaults } from '@mrapi/common'
import axios from 'axios'

export class Gateway extends App {
  services: Map<string, GatewayServiceOptions> = new Map()
  clients: { [key: string]: AxiosInstance } = {}

  constructor(public config: mrapi.GatewayOptions) {
    super(config.app)
    const { gateway } = resolveConfig({
      gateway: config,
    })
    if (gateway) {
      this.config = gateway
      this.initServices()
    }
  }

  initServices() {
    if (!Array.isArray(this.config.services)) {
      return
    }

    for (const config of this.config.services) {
      this.addService(config)
    }
  }

  createProxy(options?: any) {
    return Proxy({
      http2: this.config.app.http2,
      ...(options || {}),
    })
  }

  addService(options: mrapi.GatewayServiceConfig) {
    if (this.services.get(options.name)) {
      throw new Error(`Service '${options.name}' already exist`)
    }

    const { proxy, close } = this.createProxy({
      base: options.url,
    })

    const prefix = `/${options.name}`

    this.all(`${prefix}/*?`, (req, res) => {
      let targetPath = req.url.replace(prefix, '')
      targetPath = targetPath || '/'
      proxy(req, res, targetPath, {})
    })

    this.services.set(options.name, {
      ...options,
      prefix,
      proxy,
      close,
    })

    if (this.config.clients) {
        this.clients[options.name] = axios.create({
        baseURL: options.url,
        timeout: 30000,
      })
    }
  }

  removeService(name: string) {
    const service = this.services.get(name)

    if (!service) {
      throw new Error(`Service '${name}' not found`)
    }

    // remove router
    // TODO: all methods
    this.off('GET', service.prefix as string)
    service.close()
    service.proxy = null
    this.services.delete(name)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.clients[name]
  }

  logEndpoints() {
    const { address, port } = this.server?.address() as AddressInfo
    const host = `http://${address === '::' ? 'localhost' : address}:${port}`

    this.logger.info('Endpoints:')
    for (const service of this.services.values()) {
      this.logger.info(`${host}${service.prefix}`)
    }
  }

  async start(port: number = defaults.port) {
    return await new Promise((resolve, reject) => {
      this.listen(port, (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          this.logEndpoints()
          resolve(this.server?.address())
        }
      })
    })
  }
}

export default (gatewayOptions: mrapi.GatewayOptions) =>
  new Gateway(gatewayOptions)
