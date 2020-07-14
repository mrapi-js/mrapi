import { join } from 'path'
import { pathExists, runPrisma } from '@mrapi/common'
import { Management } from '@mrapi/multi-tenant'

import create from './create'
import { migrate as mtMigrate, studio } from './multi-tenant'

const checkPrismaSchema = (database: any, cwd = process.cwd()) => {
  const schemaFilePath = join(
    cwd,
    database?.schemaOutput || 'prisma/schema.prisma',
  )
  return pathExists(schemaFilePath)
}

export default {
  migrate: async (options: any, args = '') => {
    if (!(await checkPrismaSchema(options))) {
      await create(options)
    }

    const isMultiTenant = !!options.database.multiTenant
    if (isMultiTenant) {
      await mtMigrate.run(args, new Management())
    } else {
      await runPrisma(`migrate${args ? ' ' + args : ''}`)
    }
  },
  studio: async (options: any, args = '') => {
    const isMultiTenant = !!options.database.multiTenant
    if (isMultiTenant) {
      await studio.run(args, new Management())
    } else {
      await runPrisma(`studio${args ? ' ' + args : ''}`)
    }
  },
  introspect: async (options: any, args = '') => {
    await runPrisma(`introspect${args ? ' ' + args : ''}`)
  },
}
