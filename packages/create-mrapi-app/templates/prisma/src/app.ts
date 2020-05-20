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
        enable: true,
        options: {
          path: '/graphql',
          ide: 'playground',
          // ! important: temporary disable graphql-jit, fix memory leak caused by 'very long string'
          // jit: 1,
          queryDepth: 100,
          buildSchema: {
            resolvers: {
              generated: '../src/graphql/generated',
              custom: './src/graphql/resolvers',
            },
            emitSchemaFile: 'exports/schema.graphql',
            validate: false,
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
