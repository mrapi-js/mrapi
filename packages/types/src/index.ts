declare namespace mrapi {
  type TenantIdenityFn = (
    req: any,
    res?: any,
    params?: any,
  ) => string | Promise<string>

  interface GatewayServiceConfig {
    name: string
    url: string
  }

  interface GatewayOptions<V = any> {
    services: GatewayServiceConfig[]
  }

  interface TenantOptions {
    name: string
    database: string
    clientPath?: string
  }

  enum DatasourceProvider {
    prisma = 'prisma',
  }

  interface DatasourceOptions {
    provider?: DatasourceProvider
    schema?: string
    output?: string
  }

  enum SchemaProvider {
    nexus = 'nexus',
    typeGraphql = 'type-graphql',
  }

  interface GraphqlOptions {
    output?: string
    custom?: string
    playground?: boolean
    schemaProvider?: SchemaProvider
  }

  interface OpenapiOptions {
    output?: string
    custom?: string
  }

  interface ServiceOptions {
    name?: string
    schema?: string
    database?: string
    datasource?: DatasourceOptions
    graphql?: boolean | GraphqlOptions
    openapi?: boolean | OpenapiOptions
    studio?: boolean | number
    tenants?: Array<TenantOptions>
    defaultTenant?: string
    tenantIdentity?: string | TenantIdenityFn
    mock?: boolean
    management?: boolean
    managementTenantModelName?: string
    __isMultiTenant?: boolean
  }

  interface Config {
    service?: ServiceOptions | Array<ServiceOptions>
    gateway?: GatewayOptions
    autoGenerate?: boolean
    __cwd: string
    __parsed?: boolean
    __isMultiService?: boolean
  }
}

export = mrapi
