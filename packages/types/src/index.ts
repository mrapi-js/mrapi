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

  interface GatewayOptions {
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
    output: string
    custom: string
    playground: boolean
    generator?: GraphqlGenerator
    generatorOptions?: GeneratorOptions
  }

  interface OpenapiOptions {
    output: string
    custom: string
    generatorOptions?: GeneratorOptions
  }

  interface ServiceOptions {
    name: string
    schema: string
    database: string
    datasource?: DatasourceOptions
    graphql?: GraphqlOptions
    openapi?: OpenapiOptions
    customDir: string
    studio: boolean | number
    tenants: Array<TenantOptions>
    defaultTenant: string
    tenantIdentity: string | TenantIdenityFn
    mock?: boolean
    management?: boolean
    managementTenantModelName?: string
    isMultiTenant: boolean
    contextFile: string
  }

  interface ServiceOptionsInput
    extends Partial<
      Omit<
        ServiceOptions,
        'graphql' | 'openapi' | 'isMultiTenant' | 'contextFile'
      >
    > {
    graphql?: boolean | Partial<GraphqlOptions>
    openapi?: boolean | Partial<OpenapiOptions>
  }

  interface Config {
    cwd: string
    parsed: boolean | undefined
    service: Array<ServiceOptions>
    isMultiService: boolean
    gateway?: GatewayOptions
    autoGenerate?: boolean
  }

  interface ConfigInput
    extends Partial<Omit<Config, 'service' | 'cwd' | 'isMultiService'>> {
    service?: ServiceOptionsInput | Array<ServiceOptionsInput>
  }
}

export = mrapi