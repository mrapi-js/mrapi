import 'reflect-metadata'
import { Mrapi } from '@mrapi/core'

async function main() {
  const mrapi = new Mrapi()
  mrapi
    .start()
    .then((address) => {
      mrapi.app.log.info(`GraphQL Server:     ${address}/graphql`)
      mrapi.app.log.info(`GraphQL Playground: ${address}/playground`)
    })
    .catch((err) => {
      mrapi.app.log.error('Error starting server')
      console.error(err)
      process.exit(1)
    })
}
main().catch(console.error)
