import {
  FastifyRequest,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawServerBase,
} from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
export { ExecuteMeshFn } from '@graphql-mesh/runtime'
export { GraphQLSchema } from 'graphql'

export type HttpServer = RawServerBase
export type HttpRequest = FastifyRequest // RawRequestDefaultExpression<HttpServer>
export type HttpReply = RawReplyDefaultExpression<HttpServer>

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse>

export type Hooks = Record<string, any>

export type TypeEnum = 'standalone' | 'combined'

export interface DefaultConfig {
  server: {
    port: number
    type: TypeEnum
  }
  graphqlDir: string
  openapiDir: string
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
