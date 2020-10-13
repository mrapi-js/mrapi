import type { mrapi } from './types'

import { join, resolve } from 'path'
import {
  validateConfig,
  resolveConfig,
  ensureAbsolutePath,
  merge,
} from '@mrapi/common'

const defaults = {
  db: 'db',
}

const defaultManagementOptions: Partial<mrapi.db.PathObject> = {
  database: 'file:./management.db',
  inputSchema: './management.prisma',
}

const defaultDBOptions: Partial<mrapi.db.Options> = {
  paths: {
    input: 'config',
    output: 'node_modules/.mrapi',
  },
}

export function resolveOptions(options?: mrapi.db.Options): mrapi.db.Options {
  const config = resolveConfig()

  const dbOptions = merge(
    {
      ...defaultDBOptions,
      ...(config?.db || {}),
    },
    options || {},
  ) as mrapi.db.Options

  const isValid = validateConfig(
    dbOptions,
    resolve(__dirname, '../schemas/db.json'),
    'db',
  )

  if (!isValid) {
    process.exit(1)
  }

  dbOptions.paths = dbOptions.paths || {}
  dbOptions.paths['input'] = ensureAbsolutePath(dbOptions.paths['input'])
  dbOptions.paths['output'] = ensureAbsolutePath(dbOptions.paths['output'])

  // management
  if (dbOptions.management) {
    dbOptions.management = merge(
      defaultManagementOptions,
      dbOptions.management || {},
    )
  }
  dbOptions.tenants = Object.entries(dbOptions.tenants).map(
    ([name, database]) => {
      const tmp = resolvePaths(
        Object.assign({}, dbOptions.paths),
        dbOptions.paths,
        name,
      )
      return {
        name,
        database: database || tmp.database,
      }
    },
  )
  if (!dbOptions.defaultTenant && dbOptions.tenants.length === 1) {
    dbOptions.defaultTenant = dbOptions.tenants[0].name
  }

  dbOptions.paths.outputSchema = dbOptions.tenantSchema

  return dbOptions
}

function resolvePaths(obj: any, paths: any, name?: string) {
  obj = obj || {}

  const input = ensureAbsolutePath(obj.input || paths.input)
  const output = join(ensureAbsolutePath(obj.output || paths.output))
  obj.input = input
  obj.output = output

  if (!obj.database || obj.database.startsWith('file:')) {
    obj['outputDatabase'] = join(output, obj.outputDatabase || defaults.db)

    if (!obj.database) {
      obj.database = `file:${join(obj.outputDatabase, `${name}.db`)}`
    } else {
      const url = obj.database.split('file:')[1]
      obj.database = `file:${ensureAbsolutePath(url, obj.outputDatabase)}`
    }
  }

  return obj
}
