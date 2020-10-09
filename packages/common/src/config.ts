import type Mrapi from '@mrapi/types'

import fs from 'fs-extra'
import { resolve, isAbsolute } from 'path'

import { logger } from './logger'

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
