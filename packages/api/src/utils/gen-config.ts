import * as fs from 'fs'
import util from 'util'
import assert from 'assert'

import { getConfig, merge } from '@mrapi/common'
import logger from './logger'
import type { GraphqlConfig, Obj, ApiOptions } from '../types'

function optionsVerify(config: ApiOptions) {
  const { openapi, graphql, server, schemaNames } = config
  const errorStr = '[Config Error] @mrapi/api '
  switch (server.type) {
    case 'standalone':
      assert(
        openapi.dalBaseUrl,
        `${errorStr}standlone type need openapi.dalBaseUrl`,
      )
      assert(
        graphql.sources.length > 0,
        `${errorStr}standlone type need graphql.sources.length > 0`,
      )
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
 * decription: generate graphql-mesh config file by template
 *
 * @param {Object} gConfig custom graphql config
 *
 * @returns {Object} valid graphql-mesh config
 */
function getGraphqlConfig(gConfig: GraphqlConfig): Obj {
  const ret = {
    name: gConfig.name,
    handler: {
      graphql: {
        endpoint: gConfig.endpoint,
      },
    },
    transforms: [
      {
        prefix: {
          includeRootOperations: true,
          value: gConfig.prefix,
        },
      },
    ],
  }
  switch (gConfig.type) {
    case 'openapi':
      Object.assign(ret, {
        handler: {
          openapi: {
            source: gConfig.endpoint,
            operationHeaders: gConfig.headers || {},
          },
        },
      })
      break
    case 'graphql':
    default:
      Object.assign(ret, {
        handler: {
          graphql: {
            endpoint: gConfig.endpoint,
            operationHeaders: gConfig.headers || {},
          },
        },
      })
      break
  }
  if (gConfig.snapshot) {
    Object.assign(ret.transforms[0], {
      snapshot: {
        if: 'process.env.NODE_ENV != "production"',
        apply: ['Query.*', 'Mutation.*'],
        outputDir: '__snapshots__',
      },
    })
  }
  return ret
}

/**
 * decription: generate graphql-mesh config and return API config
 *
 *
 * @returns {Object} API options
 */
export default function genConfig(options: ApiOptions): ApiOptions {
  const outputConfigName = '.meshrc.js'
  // get options
  const { api, tenantIdentity } = getConfig()
  api.tenantIdentity = tenantIdentity
  const config = merge(api, options)

  // verify options
  optionsVerify(config)

  // replace custome dir in production env
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) {
    config.graphql.dir = config.graphql.dir.replace(/src/g, 'dist')
    config.openapi.dir = config.openapi.dir.replace(/src/g, 'dist')
  }

  // generage graphql-mesh config and write file
  const graphqlConfigs: Obj[] = []
  config.graphql.sources.forEach((s: GraphqlConfig) => {
    graphqlConfigs.push(getGraphqlConfig(s))
  })
  fs.writeFileSync(
    `./${outputConfigName}`,
    `
  module.exports = {
    sources: ${JSON.stringify(graphqlConfigs)}
  }
  `,
  )

  logger.info(`
~~~~~~~~~~Config Start~~~~~~~~~~~~~~~
${util.inspect(config, { compact: true })}
~~~~~~~~~~~~~~~~~~~~~~~~~
`)
  logger.info(`[Start] gen config file ${outputConfigName} done`)

  return config
}
