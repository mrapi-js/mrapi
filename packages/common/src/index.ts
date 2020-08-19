import merge from 'deepmerge'

import getConfig, { MrapiConfig } from './getConfig'
import getPrismaClient from './getPrismaClient'

export * from './types'
export * from './errors'
export * from './shell'
export * from './utils'
export { merge, getConfig, getPrismaClient, MrapiConfig }
