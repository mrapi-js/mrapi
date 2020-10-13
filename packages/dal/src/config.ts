import type { mrapi } from './types'

import cors from 'cors'
import bodyParser from 'body-parser'
import { join, resolve } from 'path'
import {
  validateConfig,
  resolveConfig,
  ensureAbsolutePath,
  merge,
} from '@mrapi/common'

const defaults = {
  graphql: 'graphql',
  openapi: 'openapi',
  prisma: 'prisma',
  management: 'management',
  schema: 'schema.prisma',
  managementSchema: 'management.prisma',
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
  ],
}

const defaultGraphqlOptions: Partial<mrapi.dal.GraphqlOptions> = {
  enable: true,
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
  // In the event of a multi-tenant exception, whether or not an error is thrown.
}

export const defaultDatabaseTypes: mrapi.dal.DatabaseType[] = [
  'sqlite',
  'mysql',
  'postgresql',
]

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
      serviceOptions.paths = serviceOptions.paths || {}

      serviceOptions.paths['input'] = ensureAbsolutePath(
        serviceOptions.paths?.input || dalOptions.paths.input,
      )
      serviceOptions.paths['output'] = join(
        ensureAbsolutePath(
          serviceOptions.paths?.output || dalOptions.paths.output,
        ),
      )

      resolveServicePaths(serviceOptions)

      serviceOptions.db.name = serviceOptions.name
      serviceOptions.db['management'] =
        serviceOptions.db?.management || dalOptions.management
      serviceOptions.db['paths'] = serviceOptions.db['paths'] || {}
      serviceOptions.db.paths['output'] =
        serviceOptions.db.paths['output'] || serviceOptions.paths.output
      serviceOptions.db['tenantSchema'] = serviceOptions.paths.outputSchema

      return {
        ...defaultServiceOptions,
        ...serviceOptions,
        name: serviceOptions.name,
        graphql: {
          ...defaultGraphqlOptions,
          ...(serviceOptions.graphql || {}),
        } as mrapi.dal.GraphqlOptions,
        openapi: {
          ...defaultOpenapiOptions,
          ...(serviceOptions.openapi || {}),
        },
      }
    },
  )

  return dalOptions
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

function resolveServicePaths(opts: mrapi.dal.ServiceOptions) {
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
}
