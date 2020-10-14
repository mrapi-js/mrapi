import type { mrapi } from '../../types'

import DAL from '../..'

import { join, dirname } from 'path'
import { fs, runPrisma, getLogger } from '@mrapi/common'

const logger = getLogger(null, {
  name: 'mrapi-migrate',
})

export async function migrate(
  name: string,
  action = '',
  tenants: [],
  dal?: DAL,
) {
  const dalInstance = dal || new DAL()
  const dalOptions = dalInstance.options

  // check

  if (name === 'management') {
    if (!dalOptions.management) {
      logger.error('multi-tenant management not enabled.')
      process.exit()
    }

    const managementSchema = dalOptions.management.outputSchema
    if (!(await fs.pathExists(managementSchema))) {
      logger.error(
        'management schema has not been generated, please run "mrapi generate" first',
      )
      process.exit()
    }

    if (dalOptions.management?.database.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(dalOptions.management.outputDatabase)
    }

    if (!action || action === 'save') {
      await migrateSave({
        schema: managementSchema,
        dbUrl: dalOptions.management.database,
      })
      logger.info(`successfully migrate save: service "management"`)
    }
    if (!action || action === 'up') {
      await migrateUp({
        schema: managementSchema,
        dbUrl: dalOptions.management.database,
      })
      logger.info(`successfully migrate up: service "management"`)
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

  let saved = false

  for (const tenant of (service.db as mrapi.db.Options)?.tenants) {
    const tenantSchema = service.paths.outputSchema

    if (!(await fs.pathExists(tenantSchema))) {
      logger.error(
        `service "${service.name}" schema has not been generated, please run "mrapi generate" first`,
      )
      process.exit()
    }

    if (tenant?.database?.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(join(service.paths.output, 'db'))
    }

    const migrateOpts = {
      schema: service.paths.outputSchema,
      dbUrl: tenant.database,
    }

    if ((!action || action === 'save') && !saved) {
      await migrateSave(migrateOpts)
      saved = true
      logger.info(`successfully migrate save: service "${service.name}"`)
    }
    if (!action || action === 'up') {
      await migrateUp(migrateOpts)
      logger.info(
        `successfully migrate up: service "${service.name}" tenant "${tenant.name}"`,
      )
    }
  }
}

export function migrateSave({
  schema,
  dbUrl,
}: {
  schema: string
  dbUrl: string
}) {
  if (!schema || !dbUrl) {
    logger.error(`"schema" and "dbUrl" are required for migrate.`)
    process.exit(1)
  }

  return runPrisma(
    `migrate save --schema=${schema} --create-db --name=""`,
    {
      env: {
        DATABASE_URL: dbUrl,
        DATABASE_OUTPUT: dirname(schema),
        verbose: 'true',
      },
    },
    logger,
  )
}

export function migrateUp({
  schema,
  dbUrl,
}: {
  schema: string
  dbUrl: string
}) {
  if (!schema || !dbUrl) {
    logger.error(`"schema" and "dbUrl" are required for migrate.`)
    process.exit(1)
  }

  return runPrisma(`migrate up --schema=${schema} --create-db`, {
    env: {
      DATABASE_URL: dbUrl,
      DATABASE_OUTPUT: dirname(schema),
    },
  })
}
