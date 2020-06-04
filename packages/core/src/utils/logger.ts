import pino from 'pino'

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
export function createLogger(options, stream = null) {
  const opts = {
    serializers: {
      ...serializers,
      ...(options.serializers || {}),
    },
    ...options,
  }

  stream = stream || opts.stream
  delete opts.stream

  if (opts.file) {
    stream = pino.destination(opts.file)
    delete opts.file
  }
  return pino(opts, stream)
}
