import * as fs from 'fs'
import path from 'path'
import defaultConfig from '../config/config.default'
import { GraphqlConfig, Obj, DefaultConfig } from '../types'

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

export default function genConfig(): DefaultConfig {
  const baseDir: string = process.cwd()
  const inputConfigName = 'config.default'
  const outputConfigName = '.meshrc.js'
  const customConfig: DefaultConfig = require(path.join(
    baseDir,
    'src/config',
    inputConfigName,
  )).default
  Object.assign(defaultConfig, customConfig)
  const graphqlConfigs: Obj[] = []
  defaultConfig.sources.forEach((s) => {
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

  console.log(`gen config file ${outputConfigName} done`)

  return defaultConfig as DefaultConfig
}
