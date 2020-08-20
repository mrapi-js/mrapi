import * as fs from 'fs'
import { GraphqlConfig, Obj, MrapiConfig } from '../types'
import logger from './logger'
import { getConfig } from '@mrapi/common'

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
export default function genConfig(): MrapiConfig {
  const outputConfigName = '.meshrc.js'
  const config: MrapiConfig = getConfig()
  const graphqlConfigs: Obj[] = []
  config.graphql.sources.forEach((s) => {
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
  ${JSON.stringify(config).replace(/},/g, '},\n').replace(/],/g, '],\n')}
~~~~~~~~~~~~~~~~~~~~~~~~~
`)
  logger.info(`[Start] gen config file ${outputConfigName} done`)

  return config
}