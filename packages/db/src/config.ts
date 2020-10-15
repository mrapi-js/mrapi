import type { mrapi } from './types'

import { resolve } from 'path'
import {
  validateConfig,
  resolveConfig,
  ensureAbsolutePath,
  merge,
} from '@mrapi/common'

export const defaultTenantName = 'default'
// tenant table name in management database
export const tenantTableName = 'tenant'

export const defaultTenantConfig = {
  name: defaultTenantName,
  database: `file:./${defaultTenantName}.db`,
}

const defaultManagementOptions: Partial<mrapi.db.PathObject> = {
  database: 'file:./management.db',
  inputSchema: './management.prisma',
}

const defaultDBOptions: Partial<mrapi.db.Options> = {
  paths: {
    input: 'config',
    output: 'node_modules/.mrapi',
    outputSchema: 'prisma/schema.prisma',
    outputDatabase: 'db',
  },
}

export function resolveOptions(
  options?: mrapi.db.Options | string,
): mrapi.db.Options {
  const config = resolveConfig()

  const tenants = resolveTenantsOptions(config?.db || options)
  const dbOptions: mrapi.db.Options = {
    ...defaultDBOptions,
    ...(config?.db || {}),
    ...(typeof options !== 'string' ? options : {}),
    tenants,
  }

  dbOptions.defaultTenant =
    dbOptions.defaultTenant || (tenants.length === 1 ? tenants[0].name : '')

  const isValid = validateConfig(
    dbOptions,
    resolve(__dirname, '../schemas/db.json'),
    'db',
  )

  if (!isValid) {
    process.exit(1)
  }

  dbOptions.paths = dbOptions.paths || {}
  dbOptions.paths.input = ensureAbsolutePath(dbOptions.paths.input)
  dbOptions.paths.output = ensureAbsolutePath(dbOptions.paths.output)

  dbOptions.paths.inputSchema = ensureAbsolutePath(
    dbOptions.paths?.inputSchema || `${defaultTenantName}.prisma`,
    dbOptions.paths.input,
  )
  dbOptions.paths.outputSchema = ensureAbsolutePath(
    dbOptions.paths.outputSchema || dbOptions.tenantSchema,
    dbOptions.paths.output,
  )
  dbOptions.paths.outputDatabase = ensureAbsolutePath(
    dbOptions.paths.outputDatabase,
    dbOptions.paths.output,
  )

  // management
  if (dbOptions.management) {
    dbOptions.management = merge(
      defaultManagementOptions,
      dbOptions.management || {},
    )
  }

  dbOptions.tenants = (dbOptions.tenants as any[]).map((tenant: any) => {
    // ensure
    return {
      ...tenant,
      database: resolveDatabasePath(
        tenant.database,
        dbOptions.paths.outputDatabase,
        tenant.name,
      ),
      prismaMiddlewares: dbOptions.prismaMiddlewares,
      prismaOptions: dbOptions.prismaOptions || {},
    }
  })

  return dbOptions
}

export function resolveTenantsOptions(
  db: null | string | mrapi.db.Options,
): mrapi.db.TenantsOption {
  let tenants: mrapi.db.TenantsOption

  if (!db) {
    tenants = [defaultTenantConfig]
  }

  if (typeof db === 'string') {
    tenants = [
      {
        name: defaultTenantName,
        database: db,
      },
    ]
  } else if (db?.tenants) {
    if (Array.isArray(db.tenants)) {
      tenants = db.tenants
    } else if (typeof db.tenants === 'object') {
      tenants = Object.entries(db.tenants).map(
        ([name, database]: [name: string, database: string]) => ({
          name,
          database,
        }),
      )
    } else {
      throw new Error('DB tenants config invalid.')
    }
  } else {
    tenants = [defaultTenantConfig]
  }

  return (tenants.map((tenant) => {
    const name = tenant.name || defaultTenantName
    return {
      name,
      database: tenant.database,
    }
  }) as mrapi.db.TenantsOption).filter(Boolean)
}

function resolveDatabasePath(dbPath: string, output: string, name: string) {
  if (!dbPath) {
    if (!name) {
      throw new Error('can not resolve database path.')
    }
    // sqlite
    return `file:${ensureAbsolutePath(`${name}.db`, output)}`
  }

  if (dbPath.startsWith('file:')) {
    // sqlite
    return `file:${ensureAbsolutePath(dbPath.split('file:')[1], output)}`
  }

  // others
  return dbPath
}
