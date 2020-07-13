import { join } from 'path'
import { pathExists, runPrisma } from '@mrapi/common'
import { Management } from '@mrapi/multi-tenant'

import create from './create'
import { generate, migrate as mtMigrate, studio } from './multi-tenant'

const checkPrismaSchema = (database: any, cwd = process.cwd()) => {
  const schemaFilePath = join(
    cwd,
    database?.schemaOutput || 'prisma/schema.prisma',
  )
  return pathExists(schemaFilePath)
}

export const db = {
  migrate: async (options: any, cwd = process.cwd(), args = '') => {
    if (!(await checkPrismaSchema(options, cwd))) {
      await create(options, cwd)
    }

    const isMultiTenant = !!options.database.multiTenant
    if (isMultiTenant) {
      await mtMigrate.run(args, new Management())
    } else {
      await runPrisma('migrate ' + args)
    }
  },
  studio: async (options: any, cwd = process.cwd(), args = '') => {
    const isMultiTenant = !!options.database.multiTenant
    if (isMultiTenant) {
      await studio.run(args, new Management())
    } else {
      await runPrisma('studio')
    }
  },
}
