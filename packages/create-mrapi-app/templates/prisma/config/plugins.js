module.exports = {
  // https://github.com/fastify/fastify-cookie#example
  'fastify-cookie': {
    enable: true,
    options: {},
  },
  // https://github.com/fastify/fastify-cors#options
  'fastify-cors': {
    enable: true,
    options: {
      credentials: true,
    },
  },
  // https://github.com/fastify/fastify-compress#options
  'fastify-compress': {
    enable: true,
    options: {
      global: false,
    },
  },
  // https://github.com/fastify/fastify-formbody#options
  'fastify-formbody': {
    enable: true,
    options: {},
  },
  // https://github.com/fastify/fastify-helmet#how-it-works
  'fastify-helmet': {
    enable: true,
    options: { hidePoweredBy: { setTo: 'Mrapi' } },
  },
  'builtIn:graphql': {
    enable: true,
    options: {
      endpoint: '/graphql',
      playground: 'playground',
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
      },
    },
  },
  'builtIn:openapi': {
    enable: false,
    options: {
      prefix: '/api',
      custom: {
        path: 'src/openapi',
      },
      // https://gitlab.com/m03geek/fastify-oas#plugin-options
      documentation: {
        enable: true,
        options: {
          routePrefix: '/documentation',
          swagger: {
            info: {
              title: 'Test swagger',
              description: 'testing the fastify swagger api',
              version: '0.1.0',
            },
            externalDocs: {
              url: 'https://swagger.io',
              description: 'Find more info here',
            },
            consumes: ['application/json'],
            produces: ['application/json'],
          },
          exposeRoute: true,
        },
      },
    },
  },
}
