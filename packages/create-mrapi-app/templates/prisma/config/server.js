module.exports = {
  host: 'localhost',
  port: 1358,
  logger: {
    prettyPrint: true,
    level: process.env.NODE_ENV === 'prodcution' ? 'info' : 'debug',
  },
}
