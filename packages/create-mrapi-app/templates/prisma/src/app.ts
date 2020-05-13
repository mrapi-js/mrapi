import 'reflect-metadata'
import { Mrapi, Request, Reply } from '@mrapi/core'

async function main() {
  const mrapi = new Mrapi({
    server: require('../config/server'),
    database: require('../config/database'),
    plugins: require('../config/plugins'),
    hooks: {
      onRequest(request: Request, reply: Reply, done: () => void) {
        // Some code
        console.log('onRequest hook')
        done()
      },
    },
  })
  mrapi
    .start()
    .then(({ app, address }) => {
      app.log.info(`GraphQL Server:     ${address}/graphql`)
      app.log.info(`GraphQL Playground: ${address}/playground`)
    })
    .catch((err) => {
      mrapi.app.log.error('Error starting server')
      console.error(err)
      process.exit(1)
    })
}
main().catch(console.error)
