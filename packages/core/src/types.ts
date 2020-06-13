import * as fastify from 'fastify'
import { Http2Server } from 'http2'
import fastifyGQL from 'fastify-gql'
import { ExecutionResult } from 'graphql'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'

import { PrismaClient } from '@prisma/client'
export { MultiTenant } from 'prisma-multi-tenant'
export { PrismaClient }

export type HttpServer = Server | Http2Server
export type HttpRequest = IncomingMessage | Http2ServerRequest
export type HttpResponse = ServerResponse | Http2ServerResponse

export type Hooks = Record<string, any>
export type Request = FastifyRequest<HttpRequest>
export type Reply = FastifyReply<HttpResponse>
export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
export type Context = {
  app: App
  request: Request
  reply: Reply
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

export type TenantOptions = {
  name: string
  provider: string
  url: string
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
  prismaClient?: {}
  multiTenant?: {
    management: {
      url: string
    }
    tenants: TenantOptions[]
    identifier: (request: Request, reply: Reply) => string | void
  }
}

export type ServerConfig = {
  options:
    | fastify.ServerOptionsAsHttp
    | fastify.ServerOptionsAsSecureHttp
    | fastify.ServerOptionsAsHttp2
    | fastify.ServerOptionsAsSecureHttp2
  listen: fastify.ListenOptions
}

export type MrapiOptions = {
  server: ServerConfig
  database: DBConfig
  plugins?: Record<string, any>
  hooks?: Hooks
}

type originCallback = (err: Error | null, allow: boolean) => void
type originFunction = (origin: string, callback: originCallback) => void
type originType = string | boolean | RegExp
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}

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
