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
      mesh2: {
        sources: [
          {
            //  The name you wish to set to your remote API, this will be used for building the GraphQL context
            name: 'Pet',
            handler: {
              openapi: {
                // A pointer to your API source - could be a local file, remote file or url endpoint

                // source: 'https://petstore.swagger.io/v2/swagger.json',
                // source:
                //   'https://b2b.cofacecentraleurope.com/api/bi/v1/swagger.yaml',
                // //  Specifies the URL on which all paths will be based on. (Overrides the server object in the OAS.)
                // baseUrl: 'https://b2b.cofacecentraleurope.com:443/api/bi/v1',
                // source: 'https://generator.swagger.io/api/swagger.json', // https://generator.swagger.io/
                // baseUrl: 'https://generator.swagger.io/api',
                source:
                  'https://api.apis.guru/v2/specs/1forge.com/0.0.1/swagger.yaml',
                baseUrl: 'https://api.apis.guru/forex-quotes',
                // sourceFormat: 'json',
              },
            },
            // List of transforms to apply to the current API source, before unifying it with the rest of the sources
            transforms: [...commonTransforms],
          },
        ],
        // Transform to apply to the unified mesh schema
        transforms: [],
      },
    },
    service: {
      sources: [
        // {
        //   //  The name you wish to set to your remote API, this will be used for building the GraphQL context
        //   name: 'User',
        //   handler: {
        //     graphql: {
        //       // A url to your remote GraphQL endpoint
        //       endpoint: 'http://localhost:1358/graphql/one',
        //     },
        //   },
        //   // List of transforms to apply to the current API source, before unifying it with the rest of the sources
        //   transforms: [...commonTransforms],
        // },
        {
          //  The name you wish to set to your remote API, this will be used for building the GraphQL context
          name: 'User',
          handler: {
            graphql: {
              // A url to your remote GraphQL endpoint
              endpoint: 'http://localhost:1358/graphql/one',
            },
          },
          // List of transforms to apply to the current API source, before unifying it with the rest of the sources
          // transforms: [...commonTransforms],
        },
      ],
      // Transform to apply to the unified mesh schema
      transforms: [],
    },
  },
}
