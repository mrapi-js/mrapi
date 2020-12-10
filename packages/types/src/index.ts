/**
 * Namespace of mrapi config
 */
declare namespace mrapi {
  /**
   * Funtion of get the tenant idenity
   */
  type TenantIdenityFn = (
    req: any,
    res?: any,
    params?: any,
  ) => string | Promise<string>

  /**
   * Services of gateway
   *
   * @interface GatewayServiceConfig
   */
  interface GatewayServiceConfig {
    name: string
    url: string
    type?: 'graphql' | 'openapi'
  }

  interface GatewayOptions {
    services: GatewayServiceConfig[]
  }

  interface TenantOptions {
    name: string
    database?: string
    clientPath?: string
  }

  type MultiTenantMode = 'single-db' | 'seprate-db'

  interface MultiTenantOptions {
    /**
     * Multi-tenant mode. ('single-db' | 'seprate-db')
     *
     * @type {MultiTenantMode}
     * @memberof MultiTenantOptions
     */
    mode?: MultiTenantMode
    /**
     * Default tenant name
     *
     * @type {string}
     * @memberof MultiTenantOptions
     */
    default?: string
    /**
     * Tenant identity of the multi-tenant request
     *
     * @type {(string | TenantIdenityFn)}
     * @memberof MultiTenantOptions
     */
    identity?: string | TenantIdenityFn
  }

  type DatasourceProvider = 'prisma'

  interface DatasourceOptions {
    provider?: DatasourceProvider
    schema?: string
    output?: string
  }

  type GraphqlGenerator = 'nexus' | 'type-graphql'

  interface GeneratorOptions {
    models?: string[]
    javaScript?: boolean
    includeModels?: string[]
    excludeFields: string[]
    excludeModels: Array<{
      name: string
      queries?: boolean
      mutations?: boolean
    }>
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
  type Query = 'findUnique' | 'findFirst' | 'findMany' | 'findCount' | 'aggregate'
  type Mutation =
    | 'createOne'
    | 'updateOne'
    | 'upsertOne'
    | 'deleteOne'
    | 'updateMany'
    | 'deleteMany'
  type QueriesAndMutations = Query | Mutation
  type MeshSource = 'openapi' | 'graphql'

  interface GraphqlOptions {
    output: string
    custom: string
    playground: boolean
    generator?: GraphqlGenerator
    generatorOptions?: GeneratorOptions
    queryDepth?: number
    introspection?: boolean
  }

  interface OpenapiOptions {
    output: string
    custom: string
    generatorOptions?: GeneratorOptions
  }

  interface MeshCompostion {
    resolver: string
    composer: any // function
  }

  interface MeshPrefix {
    prefix: string
    renameType?: boolean
    renameField?: boolean
    ignoreList?: string[]
  }

  interface MeshOptions {
    name: string
    type: 'openapi' | 'graphql'
    endpoint: string
    headers?: object
    prefixTransforms?: MeshPrefix
    compositions?: MeshCompostion[]
    ignoreFields?: string[]
  }

  interface ServiceOptions {
    /**
     * Mesh source
     *
     * @type {array}
     * @memberof ServiceOptions
     */
    sources: MeshOptions[]
    /**
     * Service name
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    name: string
    /**
     * Prisma schema path (relative to mrapi.config file)
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    schema: string
    /**
     * Database url (Sqlite, MySQL, PostgreSQL)
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    database: string
    /**
     * Datasource config
     *
     * @type {DatasourceOptions}
     * @memberof ServiceOptions
     */
    datasource?: DatasourceOptions
    /**
     * GraphQL config
     *
     * @type {GraphqlOptions}
     * @memberof ServiceOptions
     */
    graphql?: GraphqlOptions
    /**
     * OpenAPI config
     *
     * @type {OpenapiOptions}
     * @memberof ServiceOptions
     */
    openapi?: OpenapiOptions
    /**
     * Custom APIs path
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    customDir: string
    /**
     * Tenants config
     *
     * Each tenant config should have `name` field.
     * @type {Array<TenantOptions>}
     * @memberof ServiceOptions
     */
    tenants: TenantOptions[]
    /**
     * Multi-tenant config
     */
    multiTenant?: MultiTenantOptions
    /**
     * Should mock graphql or not
     *
     * @type {boolean}
     * @memberof ServiceOptions
     */
    mock?: boolean
    /**
     * Mark the service as management service
     *
     * @type {boolean}
     * @memberof ServiceOptions
     */
    management?: boolean
    /**
     * The tenant model name of management service. e.g.: `tenant`
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    managementTenantModelName?: string
    /**
     * Path of context file
     *
     * @type {string}
     * @memberof ServiceOptions
     */
    contextFile: string
  }

  interface PartialServiceOptions
    extends Partial<
      Omit<
        ServiceOptions,
        'graphql' | 'openapi' | 'contextFile' | 'multiTenant'
      >
    > {
    /**
     * GraphQL config
     *
     * @type {(boolean | Partial<GraphqlOptions>)}
     * @memberof PartialServiceOptions
     */
    graphql?: boolean | Partial<GraphqlOptions>
    /**
     * OpenAPI config
     *
     * @type {(boolean | Partial<OpenapiOptions>)}
     * @memberof PartialServiceOptions
     */
    openapi?: boolean | Partial<OpenapiOptions>
    /**
     * Multi-tenant config
     *
     * @type {Partial<MultiTenantOptions>}
     * @memberof PartialServiceOptions
     */
    multiTenant?: Partial<MultiTenantOptions>
  }

  interface Config {
    /**
     * Dir of the config file
     *
     * @type {string}
     * @memberof Config
     */
    cwd: string
    parsed: boolean | undefined
    /**
     * API service options
     *
     * @type {Array<ServiceOptions>}
     * @memberof Config
     */
    service: ServiceOptions[]
    /**
     * Is multi-service or not
     *
     * @type {boolean}
     * @memberof Config
     */
    isMultiService: boolean
    /**
     * Gateway options
     *
     * @type {GatewayOptions}
     * @memberof Config
     */
    gateway?: GatewayOptions
  }

  interface PartialConfig
    extends Partial<Omit<Config, 'service' | 'cwd' | 'isMultiService'>> {
    /**
     * API service options
     *
     * @type {(PartialServiceOptions | Array<PartialServiceOptions>)}
     * @memberof PartialConfig
     */
    service?: PartialServiceOptions | PartialServiceOptions[]
  }
}

export = mrapi
