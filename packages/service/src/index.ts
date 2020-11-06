import type { AddressInfo } from 'net'
import type { mrapi } from './types'
import type { DB } from '@mrapi/db'
import type { Request, Response } from '@mrapi/app'

import { App } from '@mrapi/app'
import { json } from 'body-parser'
import { checkDBClient } from './graphql/utils'
import { makeGraphql, makeGraphqlPlayground } from './graphql/'
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

export class Service extends App {
  prisma: DB | undefined
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
      '@mrapi/graphql is required',
    )
    const playgroundMiddleware: typeof import('graphql-playground-middleware-express') = tryRequire(
      'graphql-playground-middleware-express',
      'graphql-playground-middleware-express is required',
    )
    const nexus: typeof import('@nexus/schema') = tryRequire(
      '@nexus/schema',
      '@nexus/schema is required',
    )

    const playgroundTabs = []

    for (const service of this.services) {
      if (!service.graphql) {
        continue
      }

      service.endpoints = service.endpoints || []
      const usingPrisma = !!service.prisma
      if (usingPrisma) {
        await this.initPrisma()
      }

      const { endpoint } = makeGraphql({
        prisma: this.prisma,
        app: this,
        service,
        config: this.config,
        middleware: graphqlMiddleware,
        getTenantIdentity: this.getTenantIdentity,
        nexus,
      })

      service.endpoints.push({
        type: 'GraphQL',
        path: endpoint,
      })

      if (this.config.__isMultiService) {
        playgroundTabs.push({ endpoint, name: service.name })
      }
    }

    const { endpoint: playgroundEndpoint } = makeGraphqlPlayground(
      this,
      playgroundMiddleware,
      playgroundTabs,
    )

    this.endpoints.push({
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
        await this.initPrisma()
      }

      const opts = makeOpenapiOptions(
        service,
        this.getTenantIdentity,
        usingPrisma ? this.prisma : undefined,
      )

      const { endpoints } = await makeOpenapi(this, opts, '/api')
      service.endpoints = service.endpoints.concat([
        {
          type: 'OpenAPI',
          path: endpoints.api,
        },
        {
          type: 'OpenAPI Swagger',
          path: endpoints.swaggerUi,
        },
        {
          type: 'OpenAPI Swagger JSON',
          path: endpoints.apiDocs,
        },
      ])
    }
  }

  protected async initPrisma() {
    if (this.prisma) {
      return
    }

    const { DB }: typeof import('@mrapi/db') = tryRequire(
      '@mrapi/db',
      '@mrapi/db is required',
      false,
    )

    const managementOptions = this.services.find((s) => !!s.management)
    const dbOptions: import('@mrapi/db').DBOptions = {
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
      dbOptions.management = {
        database: managementOptions.database!,
        tenantModelName: managementOptions.managementTenantModelName!,
        clientPath: managementOptions.prisma!.output!,
      }
      checkDBClient(managementOptions)
    }

    this.prisma = new DB(dbOptions)
    await this.prisma?.init()
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

    const { tenantIdentity } = service
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

    this.logger.info('Endpoints:')
    for (const endpoint of this.endpoints) {
      this.logger.info(`${endpoint.type}: ${host}${endpoint.path}`)
    }

    for (const service of this.services) {
      if (!Array.isArray(service.endpoints)) {
        continue
      }

      for (const endpoint of service.endpoints) {
        this.logger.info(
          `[${service.name}] ${endpoint.type}: ${host}${endpoint.path}`,
        )
      }
      console.log()
    }
  }

  async start(port: number = defaults.port) {
    this.services = ensureArray(this.config.service)
    const needGraphql = Boolean(this.services.some((s) => !!s.graphql))
    const needOpenapi = Boolean(this.services.some((s) => !!s.openapi))

    // start the server
    return new Promise((resolve, reject) => {
      this.listen(port, async (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          this.endpoints.push({
            type: 'Main Server',
            path: '/',
          })

          try {
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
