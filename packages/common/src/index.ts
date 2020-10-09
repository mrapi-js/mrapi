import merge from 'deepmerge'

import { Generators } from './generators'
import getPrisma, { getPrismaClient, getPrismaDmmf } from './prisma'

export * from './types'
export * from './shell'
export * from './utils'
export * from './logger'
export * from './config'
export * as fs from 'fs-extra'

export { merge, getPrisma, getPrismaClient, getPrismaDmmf, Generators }
