import net from 'net'
import https from 'https'
import http2 from 'http2'
import { LoggerOptions as PinoOptions } from 'pino'
import type {
  RequestHandler,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'
import type { Params, ParamsDictionary } from 'express-serve-static-core'
import type { App } from '.'

export enum HTTPVersion {
  V1 = 'http1',
  V2 = 'http2',
}

export type Server = net.Server

export type Middleware<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query
> = RequestHandler<P, ResBody, ReqBody, ReqQuery> | App

export type Next = (err?: string | Error) => void

export interface Request extends ExpressRequest {}

export interface Response extends ExpressResponse {}

export type ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next?: Next,
) => void

export type DefaultRoute = (req: Request, res: Response) => void

export interface Query {
  [key: string]: undefined | string | string[] | Query | Query[]
}
export interface ParsedURL {
  _raw: string
  href: string
  path: string
  search: null | string
  query: Query
  pathname: string
}

export interface Options {
  server?: Server
  cache?: number
  http2?: boolean | http2.SecureServerOptions
  https?: https.ServerOptions
  errorHandler?: ErrorHandler
  defaultRoute?: DefaultRoute
  logger?: LoggerOptions
  port?: number
}

export interface LoggerOptions extends PinoOptions {}
