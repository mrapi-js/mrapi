export function createDBClientInstance(Client: any, url: string) {
  process.env.DATABASE_URL = url
  return new Client({
    datasources: {
      db: {
        url,
      },
    },
  })
}

export function checkFunction(fn: any, name: string, logger = console) {
  if (!fn) {
    logger.error(`client "${name}" function not configured.`)
    return false
  }

  if (typeof fn !== 'function') {
    logger.error(`client "${name}" should be a function.`)
    return false
  }

  return true
}
