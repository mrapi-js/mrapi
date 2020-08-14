import {
  FastifyRequest,
  FastifyInstance,
  FastifyReply,
  RawReplyDefaultExpression,
  RawServerBase,
} from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
// import { PrismaClient } from '@prisma/client'

export { ExecuteMeshFn } from '@graphql-mesh/runtime'
export { GraphQLSchema } from 'graphql'
export { Logger } from 'pino'
export { Level } from 'pino-multi-stream'

export type HttpServer = RawServerBase
export type HttpRequest = FastifyRequest // RawRequestDefaultExpression<HttpServer>
export type HttpReply = RawReplyDefaultExpression<HttpServer>

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>

export type Hooks = Record<string, any>

export type TypeEnum = 'standalone' | 'combined'

export { FastifyReply, FastifyRequest } from 'fastify'

export interface Context {
  reply: FastifyReply
  request: FastifyRequest
  prisema: any
}

export interface DefaultConfig {
  server: {
    port: number
    type: TypeEnum
  }
  openapi: {
    dir: string
    dalBaseUrl: string
    prefix: string
  }
  graphql: {
    dir: string
  }
  sources: [GraphqlConfig?]
}

export interface GraphqlConfig {
  name: string
  endpoint: string
  prefix: string
  snapshot?: boolean
}

export interface Obj {
  [key: string]: any
}

type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
