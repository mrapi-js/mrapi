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

  type DatasourceProvider = 'prisma'
  // Single Database for Single Tenant
  // Separate Schema for Each Tenant
  // Shared Schema for Tenants
  type TenantMode = ''

  interface DatasourceOptions {
    provider?: DatasourceProvider
    schema?: string
    output?: string
    tenantMode?: string
  }

  type GraphqlGenerator = 'nexus' | 'type-graphql'

  interface GeneratorOptions {
    models?: string[]
    javaScript?: boolean
    includeModels?: string[]
    excludeFields: string[]
    excludeModels: {
      name: string
      queries?: boolean
      mutations?: boolean
    }[]
    disableQueries?: boolean
    disableMutations?: boolean
    excludeFieldsByModel: {
      [modelName: string]: string[]
    }
    onDelete?: boolean
    excludeQueriesAndMutationsByModel: {
      [modelName: string]: QueriesAndMutations[]
    }
    excludeQueriesAndMutations: QueriesAndMutations[]
  }
  type Query = 'findOne' | 'findFirst' | 'findMany' | 'findCount' | 'aggregate'
  type Mutation =
    | 'createOne'
    | 'updateOne'
    | 'upsertOne'
    | 'deleteOne'
    | 'updateMany'
    | 'deleteMany'
  type QueriesAndMutations = Query | Mutation

  interface GraphqlOptions {
    output?: string
    custom?: string
    playground?: boolean
    generator?: GraphqlGenerator
    generatorOptions?: GeneratorOptions
  }

  interface OpenapiOptions {
    output?: string
    custom?: string
    generatorOptions?: GeneratorOptions
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
