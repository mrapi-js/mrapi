import { join, dirname } from 'path'
import { runPrisma } from '@mrapi/common'

import create from './create'
import { generate } from './multi-tenant'

export default async (options: any, cwd = process.cwd(), args: any) => {
  if (!options) {
    throw new Error('options is required')
  }

  await create(options, cwd)

  const envPath = join(dirname(options.database.schemaOutput), '.env')
  require('dotenv').config({
    path: envPath,
  })
  try {
    const isMultiTenant = !!options.database.multiTenant
    if (isMultiTenant) {
      await generate.run(args)
      console.log('prisma multiple tenants generated')
    } else {
      await runPrisma('generate')
      console.log('prisma client generated')
    }
  } catch (err) {
    if (!err.message.includes('defined any model in your schema.prisma')) {
      throw err
    }
  }
  process.exit(0)
}
