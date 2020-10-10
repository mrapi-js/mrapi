import DAL from '../..'

import { join, resolve } from 'path'
import { fs, resolveConfig, runPrisma, validateConfig } from '@mrapi/common'

export async function migrate(
  name: string,
  action = '',
  tenants: string[] = [],
) {
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

    if (dalOptions.management?.database.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(join(dalOptions.management.prismaClient, 'db'))
    }

    const managementSchema = join(
      dalOptions.management.prismaClient,
      'schema.prisma',
    )
    if (!action || action === 'save') {
      await migrateSave(
        managementSchema,
        dalOptions.management.database,
        dalOptions.management.prismaClient,
      )
    }
    if (!action || action === 'up') {
      await migrateUp({
        schema: managementSchema,
        dbUrl: dalOptions.management.database,
        output: dalOptions.management.prismaClient,
      })
    }
    return
  }

  // validate service name
  const service = dalOptions.services.find((service) => service.name === name)
  if (!service) {
    throw new Error(`Service "${name}" is not configured in "dal".`)
  }
  const schema = join(service.paths.output, 'schema.prisma')

  let saved = false

  for (const [name, url] of Object.entries(service.tenants)) {
    if (url.startsWith('file:')) {
      // ensure db dir
      await fs.ensureDir(join(service.paths.output, 'db'))
    }

    if ((!action || action === 'save') && !saved) {
      await migrateSave(schema, url)
      saved = true
      console.log(`service "${service.name}" migrated save`)
    }
    if (!action || action === 'up') {
      await migrateUp({ schema, dbUrl: url })
      console.log(`tenant "${name}" migrated up`)
    }
  }
}

export async function migrateSave(
  schema: string,
  dbUrl: string,
  output?: string,
) {
  return runPrisma(`migrate save --schema=${schema} --create-db --name=""`, {
    env: output
      ? { MANAGEMENT_URL: dbUrl, MANAGEMENT_OUTPUT: output }
      : {
          DATABASE_URL: dbUrl,
        },
  })
}

export async function migrateUp({
  schema,
  dbUrl,
  output,
}: {
  schema: string
  dbUrl: string
  output?: string
}) {
  return runPrisma(`migrate up --schema=${schema} --create-db`, {
    env: output
      ? { MANAGEMENT_URL: dbUrl, MANAGEMENT_OUTPUT: output }
      : {
          DATABASE_URL: dbUrl,
        },
  })
}
