exports.default = {
  api: {
    server: {
      port: 1358, // default
      type: 'standalone', // default
      options: {},
    },
    openapi: {
      dir: '/src/openapi', // default
      dalBaseUrl: 'http://localhost',
      prefix: '/api', // default
    },
    graphql: {
      dir: '/src/graphql', // default
      sources: [
        {
          name: 'auth',
          endpoint: 'http://localhost:4003/graphql', // should be replaced
          prefix: 'auth_',
          snapshot: false,
        },
      ],
    },
  },
}
