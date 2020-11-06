import net from 'net'
import https from 'https'
import http2 from 'http2'
import { LoggerOptions as PinoOptions } from 'pino'
import type {
  RequestHandler,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'
// import type { IncomingMessage, ServerResponse } from 'http'
import type { Params, ParamsDictionary } from 'express-serve-static-core'
import type { App } from '.'

declare namespace mrapi {
  enum HTTPVersion {
    V1 = 'http1',
    V2 = 'http2',
  }

  type Server = net.Server

  type Middleware<
    P extends Params = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Query
  > = RequestHandler<P, ResBody, ReqBody, ReqQuery> | App

  type Next = (err?: string | Error) => void

  interface Request extends ExpressRequest {
    path: string
    originalUrl: string
    params: {
      [key: string]: string
    }
    search: string | null
    query: Query
  }

  interface Response extends ExpressResponse {}

  type ErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next?: Next,
  ) => void

  type DefaultRoute = (req: Request, res: Response) => void

  interface Query {
    [key: string]: undefined | string | string[] | Query | Query[]
  }
  interface ParsedURL {
    _raw: string
    href: string
    path: string
    search: null | string
    query: Query
    pathname: string
  }

  interface Options {
    server?: Server
    cache?: number
    http2?: boolean | http2.SecureServerOptions
    https?: https.ServerOptions
    errorHandler?: ErrorHandler
    defaultRoute?: DefaultRoute
    logger?: LoggerOptions
    port?: number
  }

  interface LoggerOptions extends PinoOptions {}
}

export = mrapi
