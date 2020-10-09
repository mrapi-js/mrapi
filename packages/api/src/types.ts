import type mrapi from '@mrapi/types'
import type { YamlConfig } from '@graphql-mesh/types'
import type { Server, IncomingMessage, ServerResponse } from 'http'
import type { FastifyRequest, FastifyInstance, FastifyReply } from 'fastify'

export type { GraphQLSchema } from 'graphql'
export type { ExecuteMeshFn } from '@graphql-mesh/runtime'
// export type { YamlConfig as MeshConfig } from '@graphql-mesh/types'

// import type { NexusGraphQLSchema } from '@nexus/schema/dist/definitions/_types'
// export type HttpServer = RawServerBase
// export type HttpRequest = FastifyRequest // RawRequestDefaultExpression<HttpServer>
// export type HttpReply = RawReplyDefaultExpression<HttpServer>
// export { FastifyReply, FastifyRequest } from 'fastify'

// export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
// export type Hooks = Record<string, any>
// export type TypeEnum = 'standalone' | 'combined'
// export type PrismaPaths = Array<{
//   name: string
//   prismaClient: string
// }>

// export interface Context {
//   reply: FastifyReply
//   request: FastifyRequest
//   prisma: any
// }

// export interface MakeSchemaOptions {
//   schema?: NexusGraphQLSchema | {}
//   nexusDir: string
//   prismaClientDir: string
// }

// export type DALOptions = Array<{
//   name?: string
//   schema?: MakeSchemaOptions
// }>

// export interface DefaultConfig {
//   server: {
//     port: number
//     type: TypeEnum
//     options?: Obj
//   }
//   openapi: {
//     dir: string
//     dalBaseUrl?: string
//     prefix?: string
//   }
//   graphql: {
//     dir: string
//   }
//   dalOptions?: DALOptions
// }

// export interface ApiOptions {
//   tenantIdentity?: string
//   autoGenerate?: boolean
//   schemaIdentity?: string
//   openapi?: {
//     dir?: string
//     prefix?: string
//     dalBaseUrl?: string
//   }
//   graphql?: {
//     dir?: string
//     path?: string
//     playground?: string | boolean
//   }
//   // config for graphql-mesh: https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L8
//   service?: MeshConfig.Config
//   server?: {
//     type?: 'standalone' | 'combined'
//     port?: number
//     options?: {
//       [key: string]: any
//     }
//     plugins?: []
//   }
//   schemaNames?: string[]
//   logger?: LoggerOptions
//   meshConfigOuputPath?: string
// }

// export interface Obj {
//   [key: string]: any
// }

// type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
// interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}

declare module '@mrapi/types' {
  namespace api {
    interface Options {
      logger?: mrapi.LoggerOptions
      // config for graphql-mesh: https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L8
      service?: MeshConfig
      meshConfigOuputPath?: string
    }

    type ServerType = 'standalone' | 'combined'
    type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
    interface Request extends FastifyRequest {}
    interface Response extends FastifyReply {}
    interface Context {
      request: Request
      reply: Response
      prisma: any
    }
    interface MeshConfig extends YamlConfig.Config {}
  }
  // type Logger = OriginalLogger
  // export type ServerType = 'standalone' | 'combined'
  // export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
  // export interface Request extends FastifyRequest {}
  // export interface Response extends FastifyReply {}

  // export interface Context {
  //   request: Request
  //   reply: Response
  //   prisma: any
  // }

  // export interface ServerOptions extends mrapi.api.ServerOptions {}

  // export interface APIOptions extends mrapi.api.Options {
  //   logger?: LoggerOptions
  //   // config for graphql-mesh: https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L8
  //   service?: MeshConfig.Config
  //   meshConfigOuputPath?: string
  // }
}

export { mrapi }
