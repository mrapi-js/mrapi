import type { app } from '@mrapi/app'
import type { mrapi } from './types'
import type { AddressInfo } from 'net'
import type { Datasource } from '@mrapi/datasource'

import { App } from '@mrapi/app'
import { json } from 'body-parser'
import { makeGraphqlServices } from './graphql/'
import { makeOpenapi, makeOpenapiOptions } from './openapi/'
import { tryRequire, resolveConfig, defaults, ensureArray } from '@mrapi/common'

const groupBy = (arr: any[], fn: any): Record<string, any[]> =>
  arr
    .map(typeof fn === 'function' ? fn : (val) => val[fn])
    .reduce((acc: Record<string, any>, val: any, i) => {
      acc[val || ''] = (acc[val] || []).concat(arr[i])
      return acc
    }, {})

export class Service {
  app: App
  datasource: Datasource | undefined
  endpoints: Array<mrapi.Endpoint> = []
  config: mrapi.Config

  constructor(config?: mrapi.ConfigInput) {
    this.config = resolveConfig(config)
    this.app =
      config?.app ||
      new App({
        logger: this.config.logger,
      })
    this.config.logEndpoints =
      config?.logEndpoints !== undefined ? Boolean(config.logEndpoints) : true

    this.app.use(json())
  }

  get logger() {
    return this.app.logger
  }

  private async applyGraphql() {
    const endpoints = await makeGraphqlServices(
      this,
      this.getTenantIdentity.bind(this),
    )

    this.endpoints = this.endpoints.concat(endpoints)
  }

  private async applyOpenapi() {
    for (const service of this.config.service) {
      if (!service.openapi) {
        continue
      }

      const opts = makeOpenapiOptions(
        service,
        this.getTenantIdentity,
        this.datasource,
      )

      if (!opts) {
        continue
      }

      const { endpoints } = await makeOpenapi(
        this.app,
        opts,
        `/api${this.config.isMultiService ? `/${service.name}` : ''}`,
      )
      this.endpoints = this.endpoints.concat([
        {
          name: service.name,
          type: 'OpenAPI',
          path: endpoints.api,
        },
        {
          name: service.name,
          type: 'Swagger UI',
          path: endpoints.swaggerUi,
        },
        {
          name: service.name,
          type: 'Swagger JSON',
          path: endpoints.apiDocs,
        },
      ])
    }
  }

  protected async initDatasource() {
    if (this.datasource) {
      return
    }

    const { Datasource }: typeof import('@mrapi/datasource') = tryRequire(
      '@mrapi/datasource',
      'Please install it manually.',
      false,
    )

    const managementOptions = this.config.service.find((s) => !!s.management)
    const opts: import('@mrapi/datasource').DatasourceOptions = {
      services: this.config.service
        .filter((s) => !s.management)
        .map((s) => ({
          name: s.name,
          database: s.database,
          clientPath: s.datasource!.output!,
          tenants: s.tenants,
          defaultTenant: s.defaultTenant,
        })),
      provider: 'prisma' as any,
    }

    if (managementOptions) {
      opts.management = {
        database: managementOptions.database!,
        tenantModelName: managementOptions.managementTenantModelName!,
        clientPath: managementOptions.datasource!.output!,
      }
    }

    this.datasource = new Datasource(opts)
    await this.datasource?.init()
  }

  protected async getTenantIdentity(
    req: app.Request,
    res: app.Response,
    service: mrapi.ServiceOptions,
    isIntrospectionQuery = false,
  ): Promise<string> {
    if (isIntrospectionQuery) {
      return Array.isArray(service.tenants) ? service.tenants[0].name : ''
    }

    const tenantIdentity =
      service?.tenantIdentity || defaults.config.service.tenantIdentity
    if (!tenantIdentity) {
      this.logger.error(
        `"tenantIdentity" should be a string or funtion. Received: ${tenantIdentity}`,
      )
      return ''
    }

    return (typeof tenantIdentity === 'function'
      ? await tenantIdentity(req, res)
      : req.headers[tenantIdentity!]) as string
  }

  logEndpoints() {
    const { address, port } = this.app.server?.address() as AddressInfo
    const host = `http://${address === '::' ? 'localhost' : address}:${port}`
    const grouped = groupBy(this.endpoints, 'name')

    for (const [name, val] of Object.entries(grouped)) {
      for (const item of val) {
        this.logger.info(
          `${name ? `[${name}] ` : ''}${item.type.padEnd(19)}: ${host}${
            item.path
          }`,
        )
      }
      console.log()
    }
  }

  async start(port: number = defaults.port) {
    this.config.service = ensureArray(this.config.service)
    const needGraphql = Boolean(this.config.service.some((s) => !!s.graphql))
    const needOpenapi = Boolean(this.config.service.some((s) => !!s.openapi))
    const needDatasource = Boolean(
      this.config.service.some((s) => !!s.datasource),
    )

    // start the server
    return new Promise((resolve, reject) => {
      this.app.listen(port, async (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          this.endpoints.push({
            type: 'Root',
            path: '/',
          })

          try {
            if (needDatasource) {
              await this.initDatasource()
            }
            if (needGraphql) {
              await this.applyGraphql()
            }
            if (needOpenapi) {
              await this.applyOpenapi()
            }
          } catch (err) {
            reject(err)
          }

          if (this.config.logEndpoints) {
            this.logEndpoints()
          }

          resolve(this.app.server?.address())
        }
      })
    })
  }
}

export default (serviceOptions: mrapi.Config) => new Service(serviceOptions)

export * from './types'
