module.exports = {
  // https://www.fastify.io/docs/latest/Server/
  options: {
    logger: {
      prettyPrint: process.env.NODE_ENV === 'prodcution' ? false : true,
      level: process.env.NODE_ENV === 'prodcution' ? 'info' : 'debug',
    },
    disableRequestLogging: false,
  },
  listen: {
    host: 'localhost',
    port: 1358,
  },
}
