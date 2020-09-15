import * as fs from 'fs'
import util from 'util'
import assert from 'assert'
import { GraphqlConfig, Obj, ApiOptions } from '../types'
import logger from './logger'
import { getConfig, merge } from '@mrapi/common'

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
