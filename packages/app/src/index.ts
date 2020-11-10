import type {
  Server,
  Request,
  Response,
  Options,
  Middleware,
  ErrorHandler,
  DefaultRoute,
  ParsedURL,
} from './types'
import type { FindResult, HTTPMethod, Pattern } from '@mrapi/router'

import LRU from 'lru-cache'
import parser from '@polka/url'
import { Router } from '@mrapi/router'
import { createSecureServer } from 'http2'

import { getLogger, Logger } from './logger'
import { send, status } from './res'
import { Server as Http1Server, createServer } from 'http'
import { defaultRoute, errorHandler, next } from './helper'

export * as app from './types'

export class App extends Router<Middleware> {
  id: string
  readonly errorHandler: ErrorHandler
  readonly defaultRoute: DefaultRoute
  server?: Server
  parse: (req: Request, toDecode: boolean) => ParsedURL | void
  cache?: LRU<string, any>
  logger: Logger

  constructor(protected opts: Options = {}, logger?: Logger) {
    super()

    this.parse = parser
    if (this.opts.cache) {
      this.cache = new LRU(Number(this.opts.cache) || 1000)
    }

    this.errorHandler = this.opts.errorHandler || errorHandler
    this.defaultRoute = this.opts.defaultRoute || defaultRoute

    this.id = (
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    ).toUpperCase()

    this.logger = getLogger(logger, {
      ...(opts?.logger || {}),
      name: 'mrapi',
    })
  }

  use(prefix: Pattern | Middleware, ...fns: Array<Middleware>): this {
    if (typeof prefix === 'function' || prefix instanceof App) {
      super.use('/', prefix)
      return this
    }

    for (let i = 0, len = fns.length; i < len; i++) {
      if (fns[i] instanceof App) {
        // set sub app's prefix
        ;(fns[i] as any).prefix = prefix
      }
    }
    if (typeof prefix === 'string' || prefix instanceof RegExp) {
      super.use(prefix, ...fns)
    }
    return this
  }

  lookup(req: Request, res: Response, step: any): any {
    const info = this.parse(req, true)
    if (!info) {
      throw new Error('error')
    }

    let match: FindResult<Middleware>
    // req.path = info.pathname
    req.path = this.prefix
      ? info.pathname.slice(this.prefix.length)
      : info.pathname
    if (this.cache) {
      const reqCacheKey = req.method + req.path
      match = this.cache.get(reqCacheKey)
      if (!match) {
        match = this.find(req.method as HTTPMethod, req.path)
        this.cache.set(reqCacheKey, match)
      }
    } else {
      match = this.find(req.method as HTTPMethod, req.path)
    }

    req.url = req.url || '/'
    req.params = Object.assign(req.params || {}, match.params)
    req.originalUrl = req.originalUrl || req.url
    req.query = info.query || {}
    // req.search = info.search

    const middlewares = match.handlers

    if (!match || match.handlers.length === 0) {
      return this.defaultRoute(req, res)
    }

    if (step) {
      middlewares.push(step)
    }

    return next(middlewares, req, res, 0, this.errorHandler)
  }

  listen(
    port: number = this.opts.port !== undefined ? Number(this.opts.port) : 1358,
    ...args: any[]
  ) {
    if (this.opts.server) {
      // custom server
      this.server = this.opts.server
    } else if (!!this.opts.http2) {
      // http2
      if (typeof this.opts.http2 === 'boolean' && !this.opts.https) {
        throw new Error(`please config http2 in 'http2' or 'https' field`)
      }
      this.server = createSecureServer(
        typeof this.opts.http2 !== 'boolean'
          ? this.opts.http2
          : this.opts.https || {},
      )
    } else {
      // http1.1
      this.server = createServer()
    }

    this.server.on('request', (req, res) => {
      res.send = (data?: unknown) => send(req, res, data)
      res.status = (code: number) => status(res, code)
      // TODO: json method
      res.json = (data?: unknown) => send(req, res, data)

      this.server instanceof Http1Server
        ? setImmediate(() => this.lookup(req, res, null))
        : this.lookup(req, res, null)
    })

    this.server.listen(port, ...args)
    return this
  }

  close() {
    if (!this.server) {
      return Promise.reject('server not started')
    }

    return new Promise((resolve, reject) => {
      this.server?.close((err: any) => {
        if (err) reject(err)
        resolve()
      })
    })
  }
}

export default (options: Options) => new App(options)

/**
 * For express compatibility
 *
 * application
 * request
 * response
 * Route
 * Router
 * json
 * query
 * raw
 * static
 * text
 * urlencoded
 */
