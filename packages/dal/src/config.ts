import type { mrapi } from './types'

import cors from 'cors'
import bodyParser from 'body-parser'
import { join, resolve, isAbsolute } from 'path'
import { clientManagementPath } from '@prisma-multi-tenant/shared'
import {
  validateConfig,
  resolveConfig,
  getNodeModules,
  merge,
} from '@mrapi/common'

export const defaultServerOptions: Partial<mrapi.dal.ServerOptions> = {
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

export const defaultGraphqlOptions: Partial<mrapi.dal.GraphqlOptions> = {
  enable: true,
}

export const defaultOpenapiOptions: Partial<mrapi.dal.OpenapiOptions> = {
  enable: true,
}

export const defaultServiceOptions: Partial<mrapi.dal.ServiceOptions> = {}

export const defaultDalOptions: Partial<mrapi.dal.Options> = {
  paths: {
    input: 'config',
    output: 'node_modules/.mrapi',
  },
  // In the event of a multi-tenant exception, whether or not an error is thrown.
  pmtErrorThrow: true,
  // multi-tenant management config
  management: {
    enable: true,
    schema: './config/management.prisma',
    database: 'file:./db/management.db',
    // prisma-multi-tenant's default path
    prismaClient: join(getNodeModules(), clientManagementPath),
  },
}

export function resolveOptions(options?: mrapi.dal.Options): mrapi.dal.Options {
  const cwd = process.cwd()
  const config = resolveConfig()
  const isValid = validateConfig(
    config.dal,
    resolve(__dirname, '../schemas/dal.json'),
    'dal',
  )

  if (!isValid) {
    process.exit()
  }

  const dalOptions = merge(
    {
      ...defaultDalOptions,
      ...(config?.dal || {}),
    },
    options || {},
  ) as mrapi.dal.Options

  if (!isAbsolute(dalOptions.paths?.input)) {
    dalOptions['paths']['input'] = join(cwd, dalOptions.paths?.input || '')
  }

  if (!isAbsolute(dalOptions.paths?.output)) {
    dalOptions['paths']['output'] = join(cwd, dalOptions.paths?.output || '')
  }

  if (!isAbsolute(dalOptions.management.schema)) {
    dalOptions['management']['schema'] = join(
      cwd,
      dalOptions.management?.schema || '',
    )
  }

  if (!dalOptions.management?.prismaClient) {
    dalOptions['management']['prismaClient'] =
      defaultDalOptions.management.prismaClient
  }

  if (!dalOptions.management.database) {
    dalOptions['management']['database'] = `file:${join(
      defaultDalOptions.management.prismaClient,
      'db/management.db',
    )}`
  }

  dalOptions['services'] = (dalOptions?.services || []).map(
    (serviceOptions: mrapi.dal.ServiceOptions): mrapi.dal.ServiceOptions => {
      const serviceOuputRoot = join(
        dalOptions.paths.output,
        serviceOptions.name,
      )
      const management = merge(
        dalOptions.management,
        serviceOptions.management || {},
      )
      management.prismaClient = isAbsolute(management.prismaClient)
        ? management.prismaClient
        : join(cwd, management.prismaClient)

      const tenants = serviceOptions.tenants || {}

      for (const [tenantName, dbUrl] of Object.entries(
        serviceOptions.tenants,
      )) {
        if (!dbUrl.trim()) {
          // set default db url (sqlite)
          tenants[tenantName] = `file:${join(
            serviceOuputRoot,
            'db',
            `${tenantName}.db`,
          )}`
        }
      }

      return merge(
        serviceOptions,
        merge(defaultServiceOptions, {
          name: serviceOptions.name,
          schema:
            serviceOptions.schema ||
            join(dalOptions.paths.input, `${serviceOptions.name}.prisma`),
          tenants,
          graphql: {
            ...defaultGraphqlOptions,
            ...(serviceOptions.graphql || {}),
          },
          openapi: {
            ...defaultOpenapiOptions,
            ...(serviceOptions.openapi || {}),
            oasDir: join(serviceOuputRoot, 'api'),
          },
          paths: {
            input: dalOptions.paths.input,
            output: serviceOuputRoot,
            nexus: join(
              serviceOuputRoot,
              serviceOptions.paths?.nexus || 'nexus-types',
            ),
            // extra
            prismaClient: serviceOuputRoot,
          },
          management,
        }),
      )
    },
  )

  dalOptions.server = merge(defaultServerOptions, dalOptions?.server || {})

  return dalOptions
}

export const defaultDatabaseTypes: mrapi.dal.DatabaseType[] = [
  'sqlite',
  'mysql',
  'postgresql',
]
