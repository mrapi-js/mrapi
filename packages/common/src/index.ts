import merge from 'deepmerge'

import getConfig, { MrapiConfig } from './getConfig'
import getPrisma, { getPrismaClient, getPrismaDmmf } from './getPrisma'

export * from './types'
export * from './errors'
export * from './shell'
export * from './utils'
export {
  merge,
  getConfig,
  MrapiConfig,
  getPrisma,
  getPrismaClient,
  getPrismaDmmf,
}
