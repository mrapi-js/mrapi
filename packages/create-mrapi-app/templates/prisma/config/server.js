module.exports = {
  // https://www.fastify.io/docs/latest/Server/
  options: {
    logger: {
      prettyPrint: true,
      level: process.env.NODE_ENV === 'prodcution' ? 'info' : 'debug',
    },
    disableRequestLogging: true,
  },
  listen: {
    host: 'localhost',
    port: 1358,
  },
}
