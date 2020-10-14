module.exports = {
  dal: {
    // DAL service name
    name: 'string',
    // support inject an array of services
    services: [
      {
        // service name
        name: '',
        // db connection url or object
        db: '',
        // GraphQL service options
        graphql: {
          enable: true,
          // docs: https://github.com/graphql/express-graphql#options
        },
        // OpenAPI service options
        openapi: {
          enable: true,
          docs: {
            // docs: https://github.com/kogosoftwarellc/open-api/tree/master/packages/express-openapi#api
          },
        },
        // service paths
        paths: {
          // schema input path
          input: '',
          // generated code path
          output: '',
          database: '',
        },
      },
    ],
    // paths config for all services
    paths: {
      // schema input path
      input: '',
      // generated code path
      output: '',
    },
    // configuration for express server
    server: {
      host: '0.0.0.0',
      port: 1358,
      tenantIdentity: 'mrapi-tenant-id',
      enableRouteRepeat: true,
      endpoint: {
        graphql: 'graphql',
        openapi: 'openapi',
      },
      // middlewares for express
      middlewares: [
        {
          fn: Function,
          options: {},
          wrap: true,
        },
      ],
    },
    // paths config for multi-tenant management service
    management: {},
    // logger options
    logger: {
      // docs: https://github.com/pinojs/pino/blob/master/docs/api.md#options-object
    },
  },
  api: {
    server: {
      // server type: 'standalone' | 'combined'
      type: 'standalone',
      host: '0.0.0.0',
      port: 1359,
      endpoint: {
        graphql: 'graphql',
        openapi: 'openapi',
      },
      options: {},
      // plugins for fastify
      plugins: {},
    },
    // config for graphql-mesh: https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L8
    service: {},
    meshConfigOuputPath: '.meshrc.js',
    // configuration for openapi service
    openapi: {
      // local path of custom OpenAPIs
      dir: 'src/openapi',
      prefix: '/api',
      dalBaseUrl: '',
    },
    // configuration for graphql service
    graphql: {
      // docs: https://github.com/mercurius-js/mercurius#plugin-options
      dir: 'src/graphql',
      path: '/graphql',
      graphiql: 'playground',
      routes: true,
    },
    autoGenerate: true,
    tenantIdentity: 'mrapi-tenant-id',
    schemaIdentity: 'mrapi-schema',
    schemaNames: [],
    // logger options
    logger: {
      // docs: https://github.com/pinojs/pino/blob/master/docs/api.md#options-object
    },
  },
}
