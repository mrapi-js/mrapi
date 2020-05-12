import { Server } from 'http'
import { Http2Server } from 'http2'
import { PrismaClient } from '@prisma/client'
import { IncomingMessage, ServerResponse } from 'http'
import * as fastify from 'fastify'
import {
  FastifyRequest,
  FastifyReply,
  Middleware as BaseMiddleware,
  FastifyInstance,
} from 'fastify'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import fastifyGQL from 'fastify-gql'
import fastifyCompress from 'fastify-compress'
import { ExecutionResult } from 'graphql'
import {
  FastifySwaggerOptions,
  FastifyStaticSwaggerOptions,
  FastifyDynamicSwaggerOptions,
} from 'fastify-swagger'

export type HttpServer = Server | Http2Server
export type HttpRequest = IncomingMessage | Http2ServerRequest
export type HttpResponse = ServerResponse | Http2ServerResponse

// export type Middleware = BaseMiddleware<HttpServer, HttpRequest, HttpResponse>
// export type Middleware = FastifyInstance<HttpServer, HttpRequest, HttpResponse>
// export type Middleware = Record<string, any>
export type Hooks = Record<string, any>
export type Request = FastifyRequest<HttpRequest>
export type Reply = FastifyReply<HttpResponse>
export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
export type Context = {
  request: Request
  reply: Reply
  prisma: PrismaClient
  app: App
}

export interface ContextWithPrisma extends Context {
  prisma: PrismaClient
}

export enum DBEngine {
  prisma = 'prisma',
  typeorm = 'typeorm',
}
export type DBClient = PrismaClient

export interface AuthConfig {
  accessTokenName: string
  accessTokenSecret: string
  accessTokenExpiresIn: string
  refreshTokenName: string
  refreshTokenSecret: string
  refreshTokenExpiresIn: string
}

export type DBConfig = {
  provider: string
  client: string
  schema: string
  schemaOutput: string
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
  url?: string
}

export type ServerConfig = {
  host: string
  port: number
  logger?: {}
  graphql?: {
    endpoint: string
    playground: string
    resolvers: {
      generated: string
      custom: string
    }
    emitSchemaFile: string
    validate: boolean
    jit: number
    queryDepth: number
  }
  compress?: boolean | fastifyCompress.FastifyCompressOptions
  cors?: {
    /**
     * Configures the Access-Control-Allow-Origin CORS header.
     */
    origin?: ValueOrArray<originType> | originFunction
    /**
     * Configures the Access-Control-Allow-Credentials CORS header.
     * Set to true to pass the header, otherwise it is omitted.
     */
    credentials?: boolean
    /**
     * Configures the Access-Control-Expose-Headers CORS header.
     * Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range')
     * or an array (ex: ['Content-Range', 'X-Content-Range']).
     * If not specified, no custom headers are exposed.
     */
    exposedHeaders?: string | string[]
    /**
     * Configures the Access-Control-Allow-Headers CORS header.
     * Expects a comma-delimited string (ex: 'Content-Type,Authorization')
     * or an array (ex: ['Content-Type', 'Authorization']). If not
     * specified, defaults to reflecting the headers specified in the
     * request's Access-Control-Request-Headers header.
     */
    allowedHeaders?: string | string[]
    /**
     * Configures the Access-Control-Allow-Methods CORS header.
     * Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: ['GET', 'PUT', 'POST']).
     */
    methods?: string | string[]
    /**
     * Configures the Access-Control-Max-Age CORS header.
     * Set to an integer to pass the header, otherwise it is omitted.
     */
    maxAge?: number
    /**
     * Pass the CORS preflight response to the route handler (default: false).
     */
    preflightContinue?: boolean
    /**
     * Provides a status code to use for successful OPTIONS requests,
     * since some legacy browsers (IE11, various SmartTVs) choke on 204.
     */
    optionsSuccessStatus?: number
    /**
     * Pass the CORS preflight response to the route handler (default: false).
     */
    preflight?: boolean
    /**
     * Hide options route from the documentation built using fastify-swagger (default: true).
     */
    hideOptionsRoute?: boolean
  }
}

type originCallback = (err: Error | null, allow: boolean) => void
type originFunction = (origin: string, callback: originCallback) => void
type originType = string | boolean | RegExp
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}

export type Config = {
  database: DBConfig
  server: ServerConfig
  rest?: {
    enable: boolean
    prefix?: string
    schema?: Record<string, Array<string>>
    documentation?: FastifyStaticSwaggerOptions | FastifyDynamicSwaggerOptions
  }
}

declare module 'fastify' {
  // fastify-oas
  interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
    /**
     * Init OpenApi plugin
     */
    oas(): Promise<void>
  }

  // from fastify-cookie
  interface FastifyRequest<
    HttpRequest,
    Query = fastify.DefaultQuery,
    Params = fastify.DefaultParams,
    Headers = fastify.DefaultHeaders,
    Body = any
  > {
    /**
     * Request cookies
     */
    cookies: { [cookieName: string]: string }
  }

  interface CookieSerializeOptions {
    domain?: string
    encode?(val: string): string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: boolean | 'lax' | 'strict' | 'none'
    secure?: boolean
    signed?: boolean
  }

  interface FastifyReply<HttpResponse> {
    /**
     * Set response cookie
     * @param name Cookie name
     * @param value Cookie value
     * @param options Serialize options
     */
    setCookie(
      name: string,
      value: string,
      options?: CookieSerializeOptions,
    ): fastify.FastifyReply<HttpResponse>

    /**
     * clear response cookie
     * @param name Cookie name
     * @param options Serialize options
     */
    clearCookie(
      name: string,
      options?: CookieSerializeOptions,
    ): fastify.FastifyReply<HttpResponse>

    /**
     * Unsigns the specified cookie using the secret provided.
     * @param value Cookie value
     */
    unsignCookie(value: string): string | false

    // from fastify-gql
    /**
     * @param source GraphQL query string
     * @param context request context
     * @param variables request variables which will get passed to the executor
     * @param operationName specify which operation will be run
     */
    graphql(
      source: string,
      context?: any,
      variables?: { [key: string]: any },
      operationName?: string,
    ): Promise<ExecutionResult>

    // from fastify-static
    sendFile(
      filename: string,
      rootPath?: string,
    ): fastify.FastifyReply<HttpResponse>
  }

  // from fastify-gql
  interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
    /**
     * GraphQL plugin
     */
    graphql: fastifyGQL.Plugin<HttpResponse>
  }
}
