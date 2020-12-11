import type { ErrorHandler, Request, Response, Middleware } from './types'

import { App } from '.'
import { STATUS_CODES } from 'http'

export function errorHandler(err: any, _req: Request, res: Response) {
  if (typeof err === 'string' || Buffer.isBuffer(err)) {
    res.end(err)
  } else {
    const code = (res.statusCode = err.code || err.status || 500)
    res.end(err.message || STATUS_CODES[code] || '')
  }
}

export function defaultRoute(_req: Request, res: Response) {
  res.statusCode = 404
  res.end('Not Found')
}

export function next(
  middlewares: Middleware[],
  req: Request,
  res: Response,
  index: number,
  errorHandler: ErrorHandler,
) {
  const middleware = middlewares[index]
  if (!middleware) {
    // TODO: http2
    if (!(res as any).writableEnded) {
      return defaultRoute(req, res)
    }
    return
  }

  function step(err: any) {
    if (err) {
      return errorHandler(err, req, res)
    }
    return next(middlewares, req, res, index + 1, errorHandler)
  }

  try {
    if (middleware instanceof App) {
      return middleware.lookup(req, res, step)
    }
    return middleware(req, res, step)
  } catch (err) {
    return errorHandler(err, req, res)
  }
}
