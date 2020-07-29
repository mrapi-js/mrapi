import cluster from 'cluster'

// TODO
export default (): void => {
  try {
    if (cluster.isMaster) {
      console.log('cluster.isMaster')
      cluster.on('message', (worker, message) => {
        console.log({ message })
        switch (message) {
          case 'reload':
            console.log('The server is restarting\n')
            worker.send('isKilled')
            break
          case 'kill':
            worker.kill()
            cluster.fork()
            break
          case 'stop':
            worker.kill()
            process.exit(1)
          default:
        }
      })

      cluster.fork()
    }
    if (cluster.isWorker) {
      console.log('cluster.isWorker')
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
