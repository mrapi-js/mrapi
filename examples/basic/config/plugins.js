const pkg = require('../package.json')

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
      path: '/graphql',
      // schema: {
      //   // methods: findMany, findOne, create, update, upsert, updateMany, delete, deleteMany, aggregate
      //   User: ['findMany', 'create', 'aggregate'],
      //   Role: ['findMany', 'create', 'aggregate'],
      // },
      ide: process.env.NODE_ENV === 'production' ? false : 'playground',
      noIntrospection: process.env.NODE_ENV === 'production' ? true : false,
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
    enable: true,
    options: {
      prefix: '/api',
      // schema: {
      //   // methods: findMany, findOne, create, update, delete
      //   User: ['findMany'],
      //   Role: ['findMany'],
      // },
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
              title: pkg.name,
              description: pkg.description,
              version: pkg.version,
            },
            consumes: ['application/json'],
            produces: ['application/json'],
            servers: [
              {
                url: 'http://127.0.0.1:1358',
                description: 'Local Server',
              },
            ],
          },
          exposeRoute: true,
        },
      },
    },
  },
}
