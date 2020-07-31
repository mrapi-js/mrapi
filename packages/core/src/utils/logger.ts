// import pino from 'pino'
import { loadConfig } from '../config'
import { HttpLogger, HttpLoggerOptions } from '../types'
const logger = require('fastify/lib/logger')
// import { merge } from '@mrapi/common'

// const serializers = {
//   req: function asReqValue(req: any) {
//     return {
//       method: req.method,
//       url: req.url,
//       version: req.headers['accept-version'],
//       hostname: req.hostname,
//       remoteAddress: req.ip,
//       remotePort: req.connection.remotePort,
//     }
//   },
//   err: pino.stdSerializers.err,
//   res: function asResValue(reply: any) {
//     return {
//       statusCode: reply.statusCode,
//     }
//   },
// }

export function createLogger(
  // options?: Record<string, any>,
  options?: boolean | HttpLoggerOptions,
): HttpLogger {
  // const opts = options == null || options == undefined ?
  let opts = options
  if (options == null || options === undefined) {
    const tmp = loadConfig(process.cwd())
    if (tmp) {
      opts = tmp.server?.options?.logger || {}
    }
  }
  return logger.createLogger(opts)
  // let opts = options
  // if (!opts) {
  //   const tmp = loadConfig(process.cwd())
  //   if (tmp) {
  //     opts = tmp.server?.options?.logger || {}
  //   }
  // }
  // const config: Record<string, any> = {
  //   serializers: {
  //     ...serializers,
  //     ...(opts?.serializers || {}),
  //   },
  //   ...opts,
  // }

  // stream = stream || config.stream
  // delete config.stream

  // if (config.file) {
  //   stream = pino.destination(config.file)
  //   delete config.file
  // }
  // return pino(config, stream)
}

export const log = createLogger()
