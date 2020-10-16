import type Server from '../server'
import type { mrapi } from '../types'
import type { NextFunction } from 'express'

export function loggingMiddleware(options: any, server: Server) {
  return (
    req: mrapi.dal.Request,
    res: mrapi.dal.Response,
    next: NextFunction,
  ) => {
    if (req.url.startsWith(`/${server.options.endpoint.graphql}`)) {
      server.logger.debug(`=> ${req.url}`)
    }
    next()
  }
}
