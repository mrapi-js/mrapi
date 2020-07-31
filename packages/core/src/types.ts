import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  // RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyLoggerInstance,
  RawServerBase,
  FastifyLoggerOptions,
} from 'fastify'
import { PrismaClient } from '@prisma/client'
import { Logger, LoggerOptions } from 'pino'
import { Server, IncomingMessage, ServerResponse } from 'http'

export { PrismaClient }

export type HttpServer = RawServerBase
export type HttpRequest = FastifyRequest // RawRequestDefaultExpression<HttpServer>
export type HttpReply = RawReplyDefaultExpression<HttpServer>
export type HttpLogger = Logger | FastifyLoggerInstance
export type HttpLoggerOptions = LoggerOptions | FastifyLoggerOptions

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>

export type Hooks = Record<string, any>
export interface Context {
  app: App
  request: FastifyRequest
  reply: FastifyReply
  prisma: PrismaClient
}

export enum DBEngine {
  prisma = 'prisma',
  typeorm = 'typeorm',
}

export enum DBProvider {
  postgresql = 'postgresql',
  mysql = 'mysql',
  sqlite = 'sqlite',
}

export interface TenantOptions {
  name: string
  provider: string
  url: string
}
export interface DBConfig {
  client: string
  schema: string
  schemaOutput: string
  url?: string
  prismaClient?: {}
  multiTenant?: {
    management: {
      url: string
    }
    tenants: TenantOptions[]
    identifier: (request: FastifyRequest, reply: FastifyReply) => string
  }
}

export interface ServerConfig {
  // options: FastifyServerOptions
  options: any
  listen: any
}

export interface MrapiOptions {
  server: ServerConfig
  database: DBConfig
  plugins?: Record<string, any>
  hooks?: Hooks
}

type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}

// declare module 'fastify' {
//   // fastify-oas
//   interface FastifyInstance {
//     /**
//      * Init OpenApi plugin
//      */
//     oas(): Promise<void>
//   }

//   // from fastify-cookie
//   interface FastifyRequest {
//     /**
//      * Request cookies
//      */
//     cookies: { [cookieName: string]: string }
//   }

//   interface CookieSerializeOptions {
//     domain?: string
//     encode?(val: string): string
//     expires?: Date
//     httpOnly?: boolean
//     maxAge?: number
//     path?: string
//     sameSite?: boolean | 'lax' | 'strict' | 'none'
//     secure?: boolean
//     signed?: boolean
//   }

//   interface FastifyReply {
//     /**
//      * Set response cookie
//      * @param name Cookie name
//      * @param value Cookie value
//      * @param options Serialize options
//      */
//     setCookie(
//       name: string,
//       value: string,
//       options?: CookieSerializeOptions,
//     ): fastify.FastifyReply

//     /**
//      * clear response cookie
//      * @param name Cookie name
//      * @param options Serialize options
//      */
//     clearCookie(
//       name: string,
//       options?: CookieSerializeOptions,
//     ): fastify.FastifyReply

//     /**
//      * Unsigns the specified cookie using the secret provided.
//      * @param value Cookie value
//      */
//     unsignCookie(value: string): string | false

//     // from fastify-gql
//     /**
//      * @param source GraphQL query string
//      * @param context request context
//      * @param variables request variables which will get passed to the executor
//      * @param operationName specify which operation will be run
//      */
//     graphql(
//       source: string,
//       context?: any,
//       variables?: { [key: string]: any },
//       operationName?: string,
//     ): Promise<ExecutionResult>

//     // from fastify-static
//     sendFile(filename: string, rootPath?: string): fastify.FastifyReply
//   }

//   // from fastify-gql
//   interface FastifyInstance {
//     /**
//      * GraphQL plugin
//      */
//     graphql: FastifyGQLPlugin
//   }
// }
