import pino from 'pino'
import { loadConfig } from '../config'

const serializers = {
  req: function asReqValue(req) {
    return {
      method: req.method,
      url: req.url,
      version: req.headers['accept-version'],
      hostname: req.hostname,
      remoteAddress: req.ip,
      remotePort: req.connection.remotePort,
    }
  },
  err: pino.stdSerializers.err,
  res: function asResValue(reply) {
    return {
      statusCode: reply.statusCode,
    }
  },
}
export function createLogger(options?: Record<string, any>, stream = null) {
  let opts = options
  if (!opts) {
    const tmp = loadConfig(process.cwd())
    if (tmp) {
      opts = tmp.server?.options?.logger || {}
    }
  }
  const config: Record<string, any> = {
    serializers: {
      ...serializers,
      ...(opts?.serializers || {}),
    },
    ...opts,
  }

  stream = stream || config.stream
  delete config.stream

  if (config.file) {
    stream = pino.destination(config.file)
    delete config.file
  }
  return pino(config, stream)
}

export const log = createLogger()
