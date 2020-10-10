import type mrapi from '@mrapi/types'

import Ajv from 'ajv'
import { join, isAbsolute } from 'path'

import { logger } from './logger'
import { requireResolve } from './utils'

export const defaultLoggerOptions: mrapi.LoggerOptions = {
  name: 'mrapi',
  level: 'info',
  prettyPrint: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'hostname,pid',
  },
}

export function resolveConfig(
  path?: string,
  cwd = process.cwd(),
): mrapi.Config {
  let configPath = ''

  if (path) {
    try {
      configPath = requireResolve(join(cwd, path))
    } catch (err) {
      console.error(
        `can not resolve config file from path "${path}" and cwd "${cwd}"`,
      )
    }
  }

  if (!configPath) {
    const envPath = process.env.MRAPICONFIG_PATH
    if (envPath) {
      const customPath = isAbsolute(envPath) ? envPath : join(cwd, envPath)
      try {
        configPath = requireResolve(customPath)
      } catch {}
    }
  }

  // TODO: support .ts config
  if (!configPath) {
    try {
      configPath = requireResolve(join(cwd, 'mrapi.config'))
    } catch {}
  }

  // TODO: remove on next version
  if (!configPath) {
    try {
      configPath = requireResolve(join(cwd, 'config/mrapi.config'))
    } catch {}
  }

  if (!configPath) {
    logger.error('Can not find mrapi config file.')
    process.exit(1)
  }

  const config = require(configPath)
  return config.default || config
}

export function validateConfig(
  config: any,
  schemaPath: string,
  dataVar = 'data',
) {
  const ajv = new Ajv({
    strict: false,
    verbose: true,
    allowUnionTypes: true,
    allErrors: true,
  })
  const jsonSchema = require(schemaPath)
  const validate = ajv.compile(jsonSchema, true)

  if (!validate(config)) {
    logger.error(
      `Mrapi Configuration is not valid:\n${ajv.errorsText(validate.errors, {
        separator: '\n',
        dataVar,
      })}`,
    )
    return false
  }
  return true
}
