import type { mrapi } from './types'

import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { join, resolve } from 'path'
import { resolveOptions as resolveDbOptions } from '@mrapi/db'
import { specifiedRules, NoSchemaIntrospectionCustomRule } from 'graphql'
import {
  validateConfig,
  resolveConfig,
  ensureAbsolutePath,
  merge,
} from '@mrapi/common'

const isProd = process.env.NODE_ENV === 'production'

export const defaults = {
  graphql: 'graphql',
  openapi: 'openapi',
  prisma: 'prisma',
  management: 'management',
  schema: 'schema.prisma',
  managementSchema: 'management.prisma',
  serviceName: 'default',
  db: 'db',
}

const defaultServerOptions: Partial<mrapi.dal.ServerOptions> = {
  host: '0.0.0.0',
  port: 1358,
  // multi-tenant identification (use in HTTP Request Header)
  tenantIdentity: 'mrapi-tenant-id',
  // Remove routes of the same name before adding them.
  enableRouteRepeat: true,
  endpoint: {
    graphql: 'graphql',
    openapi: 'api',
  },
  middlewares: [
    {
      fn: cors,
      options: {},
      wrap: false,
    },
    {
      fn: bodyParser.json,
      options: {},
      wrap: false,
    },
    {
      fn: cookieParser,
      options: {},
      wrap: false,
    },
  ],
}

const defaultGraphqlOptions: Partial<mrapi.dal.GraphqlOptions> = {
  enable: true,
  introspection: true,
  ...(isProd
    ? {
        // disable playground in production by default
        playground: false,
      }
    : {
        // enables playground
        playground: '/playground',
        // get more information from errors during development
        customFormatErrorFn: (error) => ({
          message: error.message,
          locations: error.locations,
          stack: error.stack ? error.stack.split('\n') : [],
          path: error.path,
        }),
      }),
}

const defaultOpenapiOptions: Partial<mrapi.dal.OpenapiOptions> = {
  enable: true,
}

export const defaultServiceOptions: Partial<mrapi.dal.ServiceOptions> = {}

const defaultManagementOptions: Partial<mrapi.dal.PathObject> = {
  database: 'file:./management.db',
  inputSchema: './management.prisma',
}

const defaultDalOptions: Partial<mrapi.dal.Options> = {
  paths: {
    input: 'config',
    output: 'node_modules/.mrapi',
  },
}

export const defaultDatabaseTypes: mrapi.dal.DatabaseType[] = [
  'sqlite',
  'mysql',
  'postgresql',
]

/**
 * Resolve DAL options
 *
 * @export
 * @param {mrapi.dal.Options} [options]
 * @returns {mrapi.dal.Options}
 */
export function resolveOptions(options?: mrapi.dal.Options): mrapi.dal.Options {
  const config = resolveConfig()

  const dalOptions = merge(
    {
      ...defaultDalOptions,
      ...(config?.dal || {}),
    },
    options || {},
  ) as mrapi.dal.Options

  const isValid = validateConfig(
    dalOptions,
    resolve(__dirname, '../schemas/dal.json'),
    'dal',
  )

  if (!isValid) {
    process.exit(1)
  }

  dalOptions.paths = dalOptions.paths || {}
  dalOptions.paths['input'] = ensureAbsolutePath(dalOptions.paths['input'])
  dalOptions.paths['output'] = ensureAbsolutePath(dalOptions.paths['output'])

  // server
  dalOptions.server = merge(defaultServerOptions, dalOptions?.server || {})

  // management
  if (dalOptions.management) {
    dalOptions.management = merge(
      defaultManagementOptions,
      dalOptions.management || {},
    )
    dalOptions.management = resolvePaths(
      dalOptions.management,
      {
        input: dalOptions.paths.input,
        output: dalOptions.paths.output,
      },
      'management',
    )
  }

  // services
  dalOptions['services'] = (dalOptions?.services || []).map(
    (serviceOptions: mrapi.dal.ServiceOptions): mrapi.dal.ServiceOptions => {
      serviceOptions.name = serviceOptions.name || defaults.serviceName
      serviceOptions.paths = serviceOptions.paths || {}
      serviceOptions.paths['input'] = ensureAbsolutePath(
        serviceOptions.paths?.input || dalOptions.paths.input,
      )
      serviceOptions.paths['output'] = join(
        ensureAbsolutePath(
          serviceOptions.paths?.output || dalOptions.paths.output,
        ),
      )

      resolveServicePaths(
        serviceOptions as mrapi.dal.ServiceOptions & {
          name?: string
          db?: string
        },
      )

      if (typeof serviceOptions.db !== 'string') {
        // sync paths to db config
        serviceOptions.db = serviceOptions.db || {}
        serviceOptions.db.paths = {
          ...serviceOptions.paths,
          ...(serviceOptions.db?.paths || {}),
        }
      }

      const db = resolveDbOptions(serviceOptions.db)
      db.name = serviceOptions.name
      db['management'] = db.management || dalOptions.management
      db['tenantSchema'] = serviceOptions.paths.outputSchema

      const graphql = merge(defaultGraphqlOptions, serviceOptions.graphql || {})

      // disable introspection when graphql.introspection is false
      if (graphql.introspection === false) {
        graphql.validationRules = [
          ...specifiedRules,
          NoSchemaIntrospectionCustomRule,
        ].concat(graphql.validationRules || [])
      }

      const openapi = merge(defaultOpenapiOptions, serviceOptions.openapi || {})

      return {
        ...defaultServiceOptions,
        ...serviceOptions,
        db,
        graphql,
        openapi,
      }
    },
  )

  return dalOptions
}

/**
 * Add extensions field to GraphQL response
 *
 * @export
 * @param {mrapi.Logger} logger
 * @returns
 */
export function makeGraphqlExtensions(logger: mrapi.Logger) {
  return ({ document, variables, operationName, result, context }: any) => {
    if (Array.isArray(result.errors)) {
      result.errors.map((error: Error) =>
        (logger || console).error(error.stack),
      )
    }
    return {
      ...(context.startTime ? { duation: Date.now() - context.startTime } : {}),
    }
  }
}

function resolvePaths(obj: any, paths: any, name?: string) {
  obj = obj || {}

  const input = ensureAbsolutePath(obj.input || paths.input)
  const output = join(
    ensureAbsolutePath(obj.output || paths.output),
    name || '',
  )
  obj.input = input
  obj.output = output

  obj['inputSchema'] = ensureAbsolutePath(
    obj.inputSchema || `${name}.prisma`,
    input,
  )

  obj['outputPrismaClient'] = ensureAbsolutePath(
    obj.outputPrismaClient || 'prisma',
    output,
  )

  obj['outputSchema'] = join(obj.outputPrismaClient, 'schema.prisma')

  if (!obj.database || obj.database.startsWith('file:')) {
    obj['outputDatabase'] = join(output, obj.outputDatabase || defaults.db)

    if (!obj.database) {
      obj.database = `file:${join(obj.outputDatabase, `${name}.db`)}`
    } else {
      const url = obj.database.split('file:')[1]
      obj.database = `file:${ensureAbsolutePath(url, obj.outputDatabase)}`
    }
  }

  return obj
}

function resolveServicePaths(
  opts: mrapi.dal.ServiceOptions & { name?: string; db?: string },
) {
  opts.paths = resolvePaths(
    opts.paths,
    { input: opts.paths.input, output: opts.paths.output },
    opts.name,
  )

  opts.paths['outputGraphql'] = ensureAbsolutePath(
    opts.paths.outputGraphql || defaults.graphql,
    opts.paths.output,
  )

  opts.paths['outputOpenapi'] = ensureAbsolutePath(
    opts.paths.outputOpenapi || defaults.openapi,
    opts.paths.output,
  )

  return opts
}
