import type { AddressInfo } from 'net'
import type { mrapi } from './types'
import type { Datasource } from '@mrapi/datasource'
import type { Request, Response } from '@mrapi/app'

import { App } from '@mrapi/app'
import { json } from 'body-parser'
import { checkDBClient } from './graphql/utils'
import { makeGraphqlServices, makeGraphqlPlayground } from './graphql/'
import { makeOpenapi, makeOpenapiOptions } from './openapi/'
import { tryRequire, resolveConfig, defaults, ensureArray } from '@mrapi/common'

const defaultOptions = {
  graphql: true,
  openapi: true,
}

function setDefaultOption(config: any) {
  config['graphql'] =
    config?.graphql !== undefined ? config.graphql : defaultOptions.graphql
  config['openapi'] =
    config?.openapi !== undefined ? config.openapi : defaultOptions.openapi
  return config
}

const groupBy = (arr: any[], fn: any): Record<string, any[]> =>
  arr
    .map(typeof fn === 'function' ? fn : (val) => val[fn])
    .reduce((acc: Record<string, any>, val: any, i) => {
      acc[val || ''] = (acc[val] || []).concat(arr[i])
      return acc
    }, {})

export class Service extends App {
  datasource: Datasource | undefined
  endpoints: Array<mrapi.Endpoint> = []
  services: Array<
    mrapi.ServiceOptions & {
      endpoints: Array<mrapi.Endpoint>
    }
  > = []
  config: mrapi.ServiceConfig

  constructor(
    config: Partial<mrapi.ServiceConfig> = {
      logEndpoints: true,
    },
  ) {
    super(config.app)
    this.config = resolveConfig(config) as mrapi.ServiceConfig
    this.config.logEndpoints =
      config.logEndpoints !== undefined ? Boolean(config.logEndpoints) : true

    this.config.service = Array.isArray(this.config.service)
      ? this.config.service.map((item: mrapi.ServiceOptions) =>
          setDefaultOption(item),
        )
      : setDefaultOption(this.config.service)

    this.use(json())
  }

  private async applyGraphql() {
    const { graphqlMiddleware }: typeof import('@mrapi/graphql') = tryRequire(
      '@mrapi/graphql',
      'Please install it manually.',
    )
    const playgroundMiddleware: typeof import('graphql-playground-middleware-express') = tryRequire(
      'graphql-playground-middleware-express',
      'Please install it manually.',
    )
    const nexus: typeof import('@nexus/schema') = tryRequire(
      '@nexus/schema',
      'Please install it manually.',
    )

    const endpoints = makeGraphqlServices({
      app: this,
      config: this.config,
      services: this.services,
      datasource: this.datasource,
      middleware: graphqlMiddleware,
      getTenantIdentity: this.getTenantIdentity.bind(this),
      nexus,
    })

    this.endpoints = this.endpoints.concat(endpoints)

    const playgroundTabs: any[] = endpoints.length > 0 ? [] : []

    const { endpoint: playgroundEndpoint } = makeGraphqlPlayground(
      this,
      playgroundMiddleware,
      playgroundTabs,
    )

    this.endpoints.push({
      name: 'united',
      type: 'GraphQL Playground',
      path: playgroundEndpoint,
    })
  }

  private async applyOpenapi() {
    for (const service of this.services) {
      if (!service.openapi) {
        continue
      }

      service.endpoints = service.endpoints || []
      const usingPrisma = !!service.prisma

      if (usingPrisma) {
        await this.initDatasource()
      }

      const opts = makeOpenapiOptions(
        service,
        this.getTenantIdentity,
        usingPrisma ? this.datasource : undefined,
      )

      if (!opts) {
        continue
      }

      const { endpoints } = await makeOpenapi(
        this,
        opts,
        `/api${this.config.__isMultiService ? `/${service.name}` : ''}`,
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

    const managementOptions = this.services.find((s) => !!s.management)
    const datasourceOptions: import('@mrapi/datasource').DatasourceOptions = {
      services: this.services
        .filter((s) => !s.management)
        .map((s) => ({
          name: s.name,
          database: s.database,
          clientPath: s.prisma!.output!,
          tenants: s.tenants,
          defaultTenant: s.defaultTenant,
        })),
      provider: 'prisma' as any,
    }

    if (managementOptions) {
      datasourceOptions.management = {
        database: managementOptions.database!,
        tenantModelName: managementOptions.managementTenantModelName!,
        clientPath: managementOptions.prisma!.output!,
      }
      checkDBClient(managementOptions)
    }

    this.datasource = new Datasource(datasourceOptions)
    await this.datasource?.init()
  }

  protected async getTenantIdentity(
    req: Request,
    res: Response,
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
    const { address, port } = this.server?.address() as AddressInfo
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
    this.services = ensureArray(this.config.service)
    const needGraphql = Boolean(this.services.some((s) => !!s.graphql))
    const needOpenapi = Boolean(this.services.some((s) => !!s.openapi))
    const needDatasource = Boolean(this.services.some((s) => !!s.prisma))

    // start the server
    return new Promise((resolve, reject) => {
      this.listen(port, async (err?: Error) => {
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

          resolve(this.server?.address())
        }
      })
    })
  }
}

export default (serviceOptions: mrapi.Config) => new Service(serviceOptions)

export * from './types'
