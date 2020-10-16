// eslint-disable-next-line
/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'

// types for mrapi config
declare namespace mrapi {
  namespace dal {
    interface Options {
      paths?: PathObject
      server?: ServerOptions
      services?: ServiceOptions[]
      management?: PathObject
      name?: string
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
      [key: string]: string
    }

    interface ServiceOptions {
      name?: string
      // db config
      db?: any // db.Options | string
      // GraphQL service options
      graphql?: GraphqlOptions
      // OpenAPI service options
      openapi?: OpenapiOptions
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

      /**
       * Enable graphql introspection or not (default: true)
       */
      introspection?: boolean
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
      outputSchema?: string | boolean
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
      [key: string]: any
    }

    interface OpenapiOptions {
      dir?: string
      prefix?: string
      url?: string
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
      migrateFn?: Function | AsyncFunction
      // prisma client options
      prismaOptions?: PrismaOptions
      // prisma middlewares
      prismaMiddlewares?: PrismaMiddlewares
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
      [key: string]: string
    }

    type TenantsOption = Array<{ options?: any } & PathObject>

    interface PrismaOptions {
      errorFormat?: 'pretty' | 'colorless' | 'minimal'
      log?: any
    }

    type PrismaMiddlewares = AsyncFunction[]
  }

  // Configs for code generation
  namespace generate {
    type Query =
      | 'findOne'
      | 'findMany'
      | 'findFirst'
      | 'findCount'
      | 'aggregate'

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
