import { join } from 'path'
import { MrapiOptions } from './types'

export const defaults = {
  server: {
    options: {
      logger: {
        prettyPrint: true,
      },
    },
    listen: {
      host: 'localhost',
      port: 1358,
    },
  },
  database: {
    provider: 'sqlite',
    client: 'prisma',
    url: 'file:dev.db',
    schema: './config/schema.prisma',
    schemaOutput: './prisma/schema.prisma',
    prismaClient: {},
  },
  plugins: {
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
  },
  hooks: {},
}

export const loadConfig = (
  cwd: string,
  { server, database, plugins, hooks }: MrapiOptions = {
    server: null,
    database: null,
  },
) => {
  let serverConfig = server
  let databaseConfig = database
  let pluginsConfig = plugins
  let hooksConfig = hooks

  if (!serverConfig) {
    try {
      const file = join(cwd, 'config/server')
      const config = require(file)
      serverConfig = config.default || config
    } catch (err) {
      serverConfig = defaults.server
    }
  }

  if (!databaseConfig) {
    try {
      const file = join(cwd, 'config/database')
      const config = require(file)
      databaseConfig = config.default || config
    } catch (err) {
      databaseConfig = defaults.database
    }
  }

  if (!pluginsConfig) {
    try {
      const file = join(cwd, 'config/plugins')
      const config = require(file)
      pluginsConfig = config.default || config
    } catch (err) {
      pluginsConfig = defaults.plugins
    }
  }

  if (!hooksConfig) {
    try {
      const file = join(cwd, 'config/hooks')
      const config = require(file)
      hooksConfig = config.default || config
    } catch (err) {
      hooksConfig = defaults.hooks
    }
  }

  return {
    server: serverConfig,
    database: databaseConfig,
    plugins: pluginsConfig,
    hooks: hooksConfig,
  }
}
