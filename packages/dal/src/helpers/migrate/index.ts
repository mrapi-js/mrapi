import type { mrapi } from '../../types'

import DAL from '../..'

import { join, dirname } from 'path'
import { fs, runPrisma } from '@mrapi/common'
import { resolveOptions as resolveDbOptions } from '@mrapi/db'

export async function migrate(
  name: string,
  action = '',
  tenants: [],
  dal?: DAL,
) {
  // TODO: validate config
  const dalInstance = dal || new DAL()
  const dalOptions = dalInstance.options

  if (name === 'management') {
    if (dalOptions.management?.database.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(dalOptions.management.outputDatabase)
    }

    const managementSchema = dalOptions.management.outputSchema
    if (!action || action === 'save') {
      await migrateSave({
        schema: managementSchema,
        dbUrl: dalOptions.management.database,
      })
    }
    if (!action || action === 'up') {
      await migrateUp({
        schema: managementSchema,
        dbUrl: dalOptions.management.database,
      })
    }
    return
  }

  // validate service name
  const service = dalOptions.services.find(
    (service: mrapi.dal.ServiceOptions) => service.name === name,
  )
  if (!service) {
    throw new Error(`Service "${name}" is not configured in "dal".`)
  }
  const schema = service.paths.outputSchema
  service.db['name'] = service.name
  service.db['management'] = service.db?.management || dalOptions.management
  service.db['paths'] = service.db['paths'] || {}
  service.db.paths['output'] =
    service.db.paths['output'] || dalOptions.paths.output

  service.db = resolveDbOptions(service.db)

  let saved = false

  for (const tenant of service.db.tenants as mrapi.dal.PathObject[]) {
    if (tenant?.database?.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(join(service.paths.output, 'db'))
    }

    if ((!action || action === 'save') && !saved) {
      await migrateSave({ schema, dbUrl: tenant.database })
      saved = true
      console.log(`service "${service.name}" migrated save`)
    }
    if (!action || action === 'up') {
      await migrateUp({ schema, dbUrl: tenant.database })
      console.log(`tenant "${name}" migrated up`)
    }
  }
}

export async function migrateSave({
  schema,
  dbUrl,
}: {
  schema: string
  dbUrl: string
}) {
  return runPrisma(`migrate save --schema=${schema} --create-db --name=""`, {
    env: {
      DATABASE_URL: dbUrl,
      DATABASE_OUTPUT: dirname(schema),
    },
  })
}

export async function migrateUp({
  schema,
  dbUrl,
}: {
  schema: string
  dbUrl: string
}) {
  return runPrisma(`migrate up --schema=${schema} --create-db`, {
    env: {
      DATABASE_URL: dbUrl,
      DATABASE_OUTPUT: dirname(schema),
    },
  })
}
