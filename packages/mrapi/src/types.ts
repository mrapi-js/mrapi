import { Server } from 'http'
import { Http2Server } from 'http2'
import { PrismaClient } from '@prisma/client'
import { IncomingMessage, ServerResponse } from 'http'
import {
  FastifyRequest,
  FastifyReply,
  Middleware as BaseMiddleware,
  FastifyInstance,
} from 'fastify'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'

export type HttpServer = Server | Http2Server
export type HttpRequest = IncomingMessage | Http2ServerRequest
export type HttpResponse = ServerResponse | Http2ServerResponse

// export type Middleware = BaseMiddleware<HttpServer, HttpRequest, HttpResponse>
// export type Middleware = FastifyInstance<HttpServer, HttpRequest, HttpResponse>
export type Middleware = Record<string, any>
export type Hook = Record<string, any>

export interface Request extends FastifyRequest<HttpRequest> {
  user: {
    id: String
    role?: any
    times?: Number
  }
}

export type Reply = FastifyReply<HttpResponse>

export type Context = {
  request: Request
  reply: Reply
}

export interface ContextWithPrisma extends Context {
  prisma: PrismaClient
}

export enum DBEngine {
  prisma = 'prisma',
  typeorm = 'typeorm',
}

export type DBClient = {
  client: PrismaClient
  context: ContextWithPrisma
}

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
}

export type Config = {
  database: DBConfig
  server: ServerConfig
  security?: any
}
