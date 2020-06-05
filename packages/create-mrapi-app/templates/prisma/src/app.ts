import 'reflect-metadata'
import { Mrapi, Request, Reply } from '@mrapi/core'
import { ErrorMiddleware } from './graphql/middlewares/ErrorMiddleware'

const plugins = require('../config/plugins')

async function main() {
  const mrapi = new Mrapi({
    server: require('../config/server'),
    database: require('../config/database'),
    plugins: {
      ...plugins,
      'builtIn:graphql': {
        ...plugins['builtIn:graphql'],
        options: {
          ...plugins['builtIn:graphql'].options,
          buildSchema: {
            ...plugins['builtIn:graphql'].options.buildSchema,
            globalMiddlewares: [ErrorMiddleware],
          },
        },
      },
    },
    hooks: {
      onRequest(request: Request, reply: Reply, done: () => void) {
        // Some code
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
