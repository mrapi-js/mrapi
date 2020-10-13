const { resolve } = require('path')

const commonTransforms = [
  {
    resolversComposition: [
      {
        resolver: '*.*',
        composer: require.resolve(
          `./${
            process.env.NODE_ENV === 'production' ? 'dist' : 'src'
          }/graphql/middlewares/openapi`,
        ),
      },
    ],
  },
]

module.exports = {
  api: {
    server: {
      port: 1359, // default
      type: 'standalone', // default
      options: {},
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
              endpoint: 'http://localhost:1358/graphql/blog',
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
  },
}
