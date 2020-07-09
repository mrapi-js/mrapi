function exitHandler(options: any, exitCode: any) {
  if (options.dbClient && options.dbClient.disconnect) {
    options.dbClient.disconnect()
  }
  process.disconnect()
  if (options.exit) process.exit()
}

export function bindExitEvent(dbClient: any) {
  // catches ctrl+c event
  process.on('exit', exitHandler.bind(null, { exit: true, dbClient }))
  process.on('SIGINT', exitHandler.bind(null, { exit: true, dbClient }))

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true, dbClient }))
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true, dbClient }))

  // error
  process.on(
    'unhandledRejection',
    exitHandler.bind(null, { exit: true, dbClient }),
  )
}
