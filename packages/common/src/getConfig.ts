import path from 'path'
import merge from 'deepmerge'

export interface MrapiConfig {
  envPath?: string
  schemaDir?: string
  outputDir?: string
  tenantIdentity?: string
  openapi: {
    dir: string
    prefix?: string
    dalBaseUrl?: string
  }
  graphql: {
    dir: string,
    sources?: []
  }
  server: {
    type: 'standalone' | 'combined'
    port: number,
    options?: {
      [key: string]: any
    }
  },
  schemaNames: string[],
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

  // @mrapi/api openapi config
  openapi: {
    // @mrapi/api openapi custom api dir
    dir: '/src/openapi',
    // @mrapi/api openapi custom api preifx
    prefix: '/api',
  },

  // @mrapi/api graphql config
  graphql: {
    // @mrapi/api graphql custom api dir
    dir: '/src/graphql',
    // @mrapi/api graphql sources
    sources: [],
  },

  // @mrapi/api server config
  server: {
    // @mrapi/api server listen port
    port: 1358,
    // @mrapi/api server type
    type: 'standalone',
    // @mrapi/api fastify server options
    options: {},
  },
  // @mrapi/api prisma schema names array
  schemaNames: [],
}

export default function getConfig(str?: string): MrapiConfig {
  let config
  try {
    config = require(path.join(process.cwd(), str || 'config/mrapi.config.js'))
    if (config.defualt) {
      config = config.defualt
    }
  } catch { }

  return config ? merge(defaultConfig, config) : config
}
