const { resolve } = require('path')

const commonTransforms = [
  {
    resolversComposition: [
      {
        resolver: '*.*',
        composer: resolve(
          `./${
            process.env.NODE_ENV === 'production' ? 'dist' : 'src'
          }/graphql/middlewares/openapi`,
        ),
      },
    ],
  },
]

const fastifyPlugins = {
  // pluginName: pluginOptions
  'fastify-cookie': {
    secret: 'my-secret', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  },
}

module.exports = {
  api: {
    server: {
      port: 1359, // default
      type: 'standalone', // default
      options: {},
      // plugins for fastify
      plugins: fastifyPlugins,
    },
    graphql: {
      dir: '/src/graphql',
    },
    tenantIdentity: 'mrapi-tenant-id',
    service: {
      sources: [
        {
          //  The name you wish to set to your remote API, this will be used for building the GraphQL context
          name: 'Blog',
          handler: {
            graphql: {
              // A url to your remote GraphQL endpoint
              endpoint: 'http://localhost:1358/graphql',
              operationHeaders: {
                'mrapi-tenant-id': '{context.tenant}',
              },
            },
          },
          // List of transforms to apply to the current API source, before unifying it with the rest of the sources
          transforms: [...commonTransforms],
        },
      ],
      // Transform to apply to the unified mesh schema
      transforms: [],
      serve: {
        exampleQuery: resolve(__dirname, './examples/users.graphql'),
      },
    },
    outputSchema: false, // output path string or boolean
  },
}
