import DAL from '../..'

import { join, resolve } from 'path'
import { resolveConfig, runPrisma, validateConfig } from '@mrapi/common'

export default async function migrate(name: string, action = '') {
  const { generate } = resolveConfig()

  if (generate) {
    const isValid = validateConfig(
      generate,
      resolve(__dirname, '../../../schemas/generate.json'),
      'generate',
    )

    if (!isValid) {
      process.exit()
    }
  }

  const dal = new DAL()
  const dalOptions = dal.options

  if (name === 'management') {
    if (!dalOptions.management.enable) {
      throw new Error('management not enabled')
    }

    const managementSchema = join(dalOptions.management.schema)
    if (!action || action === 'save') {
      await migrateSave(managementSchema, dalOptions.management.database)
    }
    if (!action || action === 'up') {
      await migrateUp(managementSchema, dalOptions.management.database)
    }
    return
  }

  // validate service name
  const service = dalOptions.services.find((service) => service.name === name)
  if (!service) {
    throw new Error(`Service "${name}" is not configured in "dal".`)
  }
  const schema = join(service.paths.output, 'schema.prisma')

  for (const url of Object.values(service.tenants)) {
    if (!action || action === 'save') {
      await migrateSave(schema, url)
    }
    if (!action || action === 'up') {
      await migrateUp(schema, url)
    }
  }
}

async function migrateSave(schema: string, dbUrl: string) {
  return runPrisma(`migrate save --schema=${schema}`, {
    env: {
      DATABASE_URL: dbUrl,
    },
  })
}

async function migrateUp(schema: string, dbUrl: string) {
  return runPrisma(`migrate up --schema=${schema}`, {
    env: {
      DATABASE_URL: dbUrl,
    },
  })
}
