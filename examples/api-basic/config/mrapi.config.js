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
      sources: [{
        //   name: 'weather',
        //   type: 'openapi',
        //   endpoint: 'https://api.apis.guru/v2/specs/mashape.com/geodb/1.0.0/swagger.json', // should be replaced
        //   prefix: 'weather_',
        //   snapshot: false,
        //   headers: {
        //     'X-RapidAPI-Key': 'f93d3b393dmsh13fea7cb6981b2ep1dba0ajsn654ffeb48c26'
        //   }
        // },
        // {
        name: 'auth',
        endpoint: 'http://106.52.61.221:30141/graphql', // should be replaced
        prefix: 'auth_',
        snapshot: false
      }],
    },
  },
}
