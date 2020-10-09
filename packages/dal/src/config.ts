import type { mrapi } from './types'

import cors from 'cors'
import { join, isAbsolute } from 'path'
import bodyParser from 'body-parser'
import { resolveConfig, merge } from '@mrapi/common'

export const defaultServerOptions: Partial<mrapi.dal.ServerOptions> = {
  host: '0.0.0.0',
  port: 1358,
  // multi-tenant identification (use in HTTP Request Header)
  tenantIdentity: 'mrapi-pmt',
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
    input: 'config/prisma',
    output: 'node_modules/.mrapi',
  },
  // In the event of a multi-tenant exception, whether or not an error is thrown.
  pmtErrorThrow: false,
  // management config
  management: {
    enable: true,
    dbUrl: 'file:config/db/management.db',
  },
}

export function resolveOptions(options?: mrapi.dal.Options): mrapi.dal.Options {
  const cwd = process.cwd()
  const { dal } = resolveConfig()
  const dalOptions = merge(
    {
      ...defaultDalOptions,
      ...(dal || {}),
    },
    options || {},
  ) as mrapi.dal.Options

  if (!isAbsolute(dalOptions.paths.input)) {
    dalOptions.paths.input = join(cwd, dalOptions.paths.input)
  }

  if (!isAbsolute(dalOptions.paths.output)) {
    dalOptions.paths.output = join(cwd, dalOptions.paths.output)
  }

  dalOptions.services = dalOptions.services.map(
    (serviceOptions: mrapi.dal.ServiceOptions): mrapi.dal.ServiceOptions => {
      const serviceOuputRoot = join(
        dalOptions.paths.output,
        serviceOptions.name,
      )

      return merge(serviceOptions, {
        name: serviceOptions.name,
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
          prismaClient: join(
            serviceOuputRoot,
            serviceOptions.paths?.prismaClient || '',
          ),
          // managementClient
        },
        management: serviceOptions.management || dalOptions.management,
      } as mrapi.dal.ServiceOptions)
    },
  )

  dalOptions.server = merge(defaultServerOptions, dalOptions.server)

  return dalOptions
}

export const defaultDatabaseTypes: mrapi.dal.DatabaseType[] = [
  'sqlite',
  'mysql',
  'postgresql',
]
