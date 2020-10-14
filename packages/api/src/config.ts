import type { mrapi } from './types'

import assert from 'assert'
import { resolve } from 'path'
import {
  fs,
  merge,
  resolveConfig,
  validateConfig,
  defaultLoggerOptions as commonLoggerOptions,
} from '@mrapi/common'

export const defaultLoggerOptions: mrapi.LoggerOptions = {
  ...commonLoggerOptions,
  name: 'mrapi-api',
}

export const defaultServerOptions: Partial<mrapi.api.ServerOptions> = {
  host: '0.0.0.0',
  // server listen port
  port: 1358,
  // server type
  type: 'standalone',
  // fastify server options
  options: {},
}

export const defaultApiOptions: Partial<mrapi.api.Options> = {
  meshConfigOuputPath: './.meshrc.js',
  // prisma schema names array
  schemaNames: [],
  // auto run scripts mrapi generate
  autoGenerate: true,
  // mrapi db choose header key
  schemaIdentity: 'mrapi-schema',
  openapi: {
    // openapi custom api dir
    dir: '',
    // openapi custom api preifx
    prefix: '/api',
  },
  graphql: {
    // graphql custom api dir
    dir: '',
    // graphql api prefix
    path: '/graphql',
    routes: true,
    graphiql: 'playground',
    ide: true,
  },
  logger: defaultLoggerOptions,
  server: defaultServerOptions,
}

function optionsVerify(config: mrapi.api.Options) {
  const { openapi, graphql, server, schemaNames } = config
  const errorStr = '[Config Error] @mrapi/api '
  switch (server.type) {
    case 'standalone':
      assert(
        openapi || graphql,
        `${errorStr}standlone type need openapi or graphql config`,
      )
      if (openapi) {
        assert(
          openapi && !openapi.dalBaseUrl,
          `${errorStr}standlone type need openapi.dalBaseUrl`,
        )
      }
      break
    case 'combined':
      assert(
        schemaNames.length > 0,
        `${errorStr}combined type need schemaNames.length > 0`,
      )
      break
    default:
      throw Error(`${errorStr}illge server.type`)
  }
}

/**
 * decription: generate graphql-mesh config and return API config
 *
 *
 * @returns {Object} API options
 */
export function resolveOptions(
  options: mrapi.api.Options,
  logger: mrapi.Logger,
) {
  const config = resolveConfig()
  if (!config) {
    throw new Error('can not detect mrapi config')
  }
  const isValid = validateConfig(
    config.api,
    resolve(__dirname, '../schemas/api.json'),
    'api',
  )
  if (!isValid) {
    process.exit()
  }

  const apiConfig = merge(defaultApiOptions, config.api || {})
  const apiOptions: mrapi.api.Options = merge(apiConfig, options || {})

  optionsVerify(apiOptions)

  // replace custome dir in production env
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) {
    if (apiOptions.graphql.dir) {
      apiOptions.graphql.dir = apiOptions.graphql.dir.replace(/src/g, 'dist')
    }
    if (apiOptions.openapi.dir) {
      apiOptions.openapi.dir = apiOptions.openapi.dir.replace(/src/g, 'dist')
    }
  }

  //  has mesh config
  if (apiOptions.service) {
    fs.outputFileSync(
      apiOptions.meshConfigOuputPath,
      `module.exports = ${JSON.stringify(apiOptions.service, null, 2)}
    `,
    )
    logger.debug(
      `[Start] gen config file ${apiOptions.meshConfigOuputPath} done`,
    )
  }

  logger.debug('apiConfig: ' + JSON.stringify(apiOptions, null, 2))

  return apiOptions
}
