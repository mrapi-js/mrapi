import merge from 'deepmerge'

import getConfig, { MrapiConfig } from './getConfig'
import getPrisma, { getPrismaClient, getPrismaDmmf } from './getPrisma'
import { Generators } from './Generators'

export * from './types'
export * from './shell'
export * from './utils'
export {
  merge,
  getConfig,
  MrapiConfig,
  getPrisma,
  getPrismaClient,
  getPrismaDmmf,
  Generators,
}
