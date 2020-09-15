import {
  FastifyRequest,
  FastifyInstance,
  FastifyReply,
  RawReplyDefaultExpression,
  RawServerBase,
} from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { NexusGraphQLSchema } from '@nexus/schema/dist/definitions/_types'
// export { PrismaClient } from '@prisma/client'

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
export type PrismaPaths = Array<{
  name: string
  prismaClient: string
}>

export interface Context {
  reply: FastifyReply
  request: FastifyRequest
  prisma: any
}

export interface MakeSchemaOptions {
  schema?: NexusGraphQLSchema | {}
  nexusDir: string
  prismaClientDir: string
}

export type DALOptions = Array<{
  name?: string
  schema?: MakeSchemaOptions
}>

export interface DefaultConfig {
  server: {
    port: number
    type: TypeEnum
    options?: Obj
  }
  openapi: {
    dir: string
    dalBaseUrl?: string
    prefix?: string
  }
  graphql: {
    dir: string
  }
  dalOptions?: DALOptions
  sources?: [GraphqlConfig]
}

export interface GraphqlConfig {
  name: string
  endpoint: string
  prefix: string
  snapshot?: boolean
}

export interface ApiOptions {
  tenantIdentity?: string
  autoGenerate?: boolean
  schemaIdentity?: string
  openapi?: {
    dir?: string
    prefix?: string
    dalBaseUrl?: string
  }
  graphql?: {
    dir?: string
    path?: string
    playground?: string | boolean
    sources?: []
  }
  server?: {
    type?: 'standalone' | 'combined'
    port?: number
    options?: {
      [key: string]: any
    }
  }
  schemaNames?: string[]
}

export interface Obj {
  [key: string]: any
}

type ValueOrArray<T> = T | ArrayOfValueOrArray<T>
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
