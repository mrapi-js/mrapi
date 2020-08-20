import path from 'path'
import merge from 'deepmerge'

export interface MrapiConfig {
  envPath?: string
  schemaDir?: string
  outputDir?: string
  tenantIdentity?: string
}

const defaultConfig: MrapiConfig = {
  // .env filePath
  envPath: 'prisma/.env',

  // schema directory
  schemaDir: 'prisma',

  // output directory （cnt and pmt）
  outputDir: 'node_modules/.prisma-mrapi',

  // multi-tenant identification (use in HTTP Request Header)
  tenantIdentity: 'mrapi-pmt',
}

export default function getConfig(str?: string): MrapiConfig {
  let config
  try {
    config = require(path.join(process.cwd(), str || 'config/mrapi.config.js'))
    if (config.defualt) {
      config = config.defualt
    }
  } catch {}

  return config ? merge(defaultConfig, config) : config
}
