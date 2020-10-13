import type { IncomingMessage, ServerResponse } from 'http'

// types for mrapi config
declare namespace mrapi {
  namespace dal {
    interface Options {
      paths?: PathObject
      server?: ServerOptions
      services?: ServiceOptions[]
      management?: PathObject
      // throw multi-tenant original errors or not
      throwOriginalError?: boolean
    }

    interface PathObject {
      name?: string
      input?: string
      output?: string
      database?: string
      inputSchema?: string
      outputSchema?: string
      outputDatabase?: string
      outputPrismaClient?: string
    }

    interface ServiceOptions {
      name: string
      // GraphQL service options
      graphql?: GraphqlOptions
      // OpenAPI service options
      openapi?: OpenapiOptions
      // multi-tenants config
      db?: db.Options
      paths?: ServicePaths
    }

    interface ServicePaths extends PathObject {
      outputGraphql?: string
      outputOpenapi?: string
    }

    interface ServerOptions {
      host?: string
      port?: number
      tenantIdentity?: string | TenantIdenityFn
      enableRouteRepeat?: boolean
      endpoint?: {
        graphql?: string
        openapi?: string
      }
      // middlewares for express
      middlewares?: Array<{
        fn: Function
        options?: any
        wrap?: boolean
      }>
    }

    interface GraphqlOptions {
      enable?: boolean
    }

    interface OpenapiOptions {
      enable?: boolean
      dependencies?: {
        [name: string]: Function | Promise<Function>
      }
      // oasDir?: string
      validateApiDoc?: boolean
    }

    type Request = IncomingMessage
    type Response = ServerResponse & { json?: (data: unknown) => void }
    type TenantIdenityFn = (
      req: Request,
      res?: Response,
      params?: any,
    ) => string | Promise<string>
    type DatabaseType = 'sqlite' | 'mysql' | 'postgresql'
  }

  namespace api {
    interface Options {
      server?: ServerOptions
      openapi?: OpenapiOptions
      graphql?: GraphqlOptions
      autoGenerate?: boolean
      tenantIdentity?: string
      schemaIdentity?: string
      schemaNames?: string[]
    }

    interface ServerOptions {
      // TODO: 'mesh' | 'with-dal' | 'gateway'
      type?: ServerType
      host?: string
      port?: number
      endpoint?: {
        graphql?: string
        openapi?: string
      }
      options?: {
        [key: string]: any
      }
      // plugins for fastify
      plugins?: {
        [key: string]: {}
      }
    }

    interface GraphqlOptions {
      dir?: string
      path?: string
      playground?: string | boolean
    }

    interface OpenapiOptions {
      dir?: string
      prefix?: string
      // TODO: rename
      dalBaseUrl?: string
    }

    // TODO: 'mesh' | 'with-dal' | 'gateway'
    type ServerType = 'standalone' | 'combined'
  }

  namespace db {
    interface Options {
      name?: string
      management?: PathObject
      tenants?: TenantsOption
      defaultTenant?: string
      tenantSchema?: string
      TenantClient?: any
      ManagementClient?: any
      paths?: PathObject
      initialize?: any
    }

    interface PathObject {
      name?: string
      input?: string
      output?: string
      database?: string
      inputSchema?: string
      outputSchema?: string
      outputDatabase?: string
      outputPrismaClient?: string
    }

    type TenantsOption =
      | {
          [name: string]: string
        }
      | Array<{ options?: any } & PathObject>
  }

  // Configs for code generation
  namespace generate {
    type Query = 'findOne' | 'findMany' | 'findCount' | 'aggregate'

    type Mutation =
      | 'createOne'
      | 'updateOne'
      | 'upsertOne'
      | 'deleteOne'
      | 'updateMany'
      | 'deleteMany'

    type QueriesAndMutations = Query | Mutation

    interface Options {
      models?: string[]
      schema: string
      output: string
      excludeFields: string[]
      excludeModels: Array<{
        name: string
        queries?: boolean
        mutations?: boolean
      }>
      disableQueries?: boolean
      disableMutations?: boolean
      excludeFieldsByModel: { [modelName: string]: string[] }
      onDelete?: boolean
      nexusSchema?: boolean
      excludeQueriesAndMutationsByModel: {
        [modelName: string]: QueriesAndMutations[]
      }
      excludeQueriesAndMutations: QueriesAndMutations[]
      javascript?: boolean
    }
  }

  interface Config {
    dal?: dal.Options
    api?: api.Options
    db?: db.Options
    generate?: generate.Options
  }
}

export = mrapi
