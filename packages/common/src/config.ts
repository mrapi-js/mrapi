import type Mrapi from '@mrapi/types'

import fs from 'fs-extra'
import { resolve, isAbsolute } from 'path'

import { logger } from './logger'

// const defaultConfig: Mrapi.Config = {
//   cli: {
//     // .env filePath
//     // envPath: 'config/.env',
//     paths: {
//       env: 'config/.env',
//     },
//   },
// }

// const defaultOpenapiConfig = {
//   // @mrapi/api openapi custom api dir
//   dir: '',
//   // @mrapi/api openapi custom api preifx
//   prefix: '/api',
// }

// const defaultGraphqlConfig: any = {
//   // @mrapi/api graphql custom api dir
//   dir: '',
//   // @mrapi/api graphql api prefix
//   path: '/graphql',
//   // @mrapi/api graphql playground
//   playground: 'playground',
//   // @mrapi/api graphql sources
//   // sources: [],
// }

export const defaultLoggerOptions: Mrapi.LoggerOptions = {
  name: 'mrapi',
  level: 'info',
  prettyPrint: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'hostname,pid',
  },
}

export function resolveConfig(str?: string): Mrapi.Config {
  const configPath = resolveConfigPath()

  try {
    const config = require(configPath)
    return config.default || config
  } catch (err) {
    logger.error(err.message)
    process.exit(1)
  }

  // userConfig = userConfig || defaultConfig

  // const openapiConfig = userConfig.api?.openapi
  //   ? Object.assign({}, defaultOpenapiConfig, userConfig.api.openapi)
  //   : null
  // const graphqlConfig = userConfig.api?.graphql
  //   ? Object.assign({}, defaultGraphqlConfig, userConfig.api.graphql)
  //   : null
  // const config = (defaultConfig, userConfig)
  // if (openapiConfig) {
  //   config.api.openapi = openapiConfig
  // }
  // if (graphqlConfig) {
  //   config.api.graphql = graphqlConfig
  // }

  // return config
}

function resolveConfigPath(): string {
  const cwd = process.cwd()
  const envPath = process.env.MRAPICONFIG_PATH
  if (envPath) {
    const customPath = isAbsolute(envPath)
      ? resolve(envPath)
      : resolve(cwd, envPath)
    if (customPath) {
      return customPath
    }
  }
  const jsConfigPath = resolve(cwd, 'mrapi.config.js')
  if (fs.pathExistsSync(jsConfigPath)) {
    return jsConfigPath
  }
  // TODO: remove on next version
  const oldConfigPath = resolve(cwd, 'config/mrapi.config.js')
  if (fs.pathExistsSync(oldConfigPath)) {
    return oldConfigPath
  }
  return ''
  // TODO: support .ts config
}
