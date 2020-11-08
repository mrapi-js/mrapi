import type mrapi from '@mrapi/types'

import assert from 'assert'
import merge from 'deepmerge'
import { join, dirname } from 'path'

import { ensureAbsolutePath, tryRequire, getWorkspaceDirs } from './utils'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = process.env.NODE_ENV === 'production'
const workDirs = getWorkspaceDirs()
const src = isProd ? workDirs.dst : workDirs.src

interface PathsObject {
  output: string
  custom: string
}

const defaultPrismaOptions = {
  output: 'node_modules/.prisma/client',
  schema: 'prisma/schema.prisma',
}

const defaultApiOutput = 'node_modules/.mrapi/'
const defaultPrismaOutput = 'node_modules/.prisma/'

const defaultServiceConfig: Partial<mrapi.ServiceOptions> = {
  defaultTenant: '',
  tenantIdentity: 'mrapi-tenant-id',
  studio: !isProd,
}

// management is a special service which has no 'apiOutput'
const defaultManagementConfig: Partial<mrapi.ServiceOptions> = {
  ...defaultServiceConfig,
  managementTenantModelName: 'tenant',
}

export const defaults = {
  config: {
    service: defaultServiceConfig,
    autoGenerate: true,
  },
  clientPath: join(process.cwd(), 'node_modules/@prisma/client'),
  configFileName: 'mrapi.config',
  tenantName: 'default',
  serviceName: 'default',
  port: 1358,
  graphql: {
    playground: !isProd,
    schemaProvider: 'nexus' as mrapi.SchemaProvider,
  },
  openapi: {},
}

export function resolveConfig(
  options?: Partial<mrapi.Config>,
  cwd = process.cwd(),
  configFileName = defaults.configFileName,
): mrapi.Config {
  if (options?.__parsed) {
    return options as mrapi.Config
  }

  const configPath =
    process.env.MRAPI_CONFIG_PATH ||
    join(cwd, configFileName || defaults.configFileName)
  const tmp = tryRequire(configPath)
  const config: mrapi.Config = merge(tmp || defaults.config, options || {})
  config.__cwd = dirname(configPath)
  config.__isMultiService = Array.isArray(config.service)
  const services: Array<mrapi.ServiceOptions> = config.service
    ? Array.isArray(config.service)
      ? config.service
      : [config.service]
    : []

  if (config.__isMultiService) {
    const hasName = services.every((val: mrapi.ServiceOptions) => !!val.name)
    assert(
      hasName,
      `[Config Error] Multiple services should have 'name' fields on each.`,
    )
  }

  config.service = services.map((service: mrapi.ServiceOptions) =>
    normalizeServiceConfig(service, config),
  )

  return {
    ...config,
    autoGenerate:
      config.autoGenerate !== undefined
        ? config.autoGenerate
        : defaults.config.autoGenerate,
    __parsed: true,
  }
}

function normalizeServiceConfig(
  service: Partial<mrapi.ServiceOptions>,
  { __isMultiService, __cwd }: mrapi.Config,
) {
  service.name = service.name || defaults.serviceName

  if (service.tenants) {
    assert(
      Array.isArray(service.tenants),
      `[Config Error] 'service.tenants' should be an array `,
    )
  }

  service.__isMultiTenant = Array.isArray(service.tenants)

  // datasource paths
  const usingDatasource = service.datasource || service.schema
  if (usingDatasource) {
    const hasDatabase = service.__isMultiTenant
      ? service.tenants?.every((t) => !!t.database)
      : !!service.database
    assert(
      hasDatabase,
      `[Config Error] Service '${
        service.name
      }' using prisma, but no 'database' field configured.${
        service.__isMultiTenant
          ? `Each tenant should configure 'database' field when using multi-tenant`
          : ''
      }`,
    )

    service.datasource = {
      ...service.datasource,
      provider:
        service.datasource?.provider || ('prisma' as mrapi.DatasourceProvider),
      schema: ensureAbsolutePath(
        service.datasource?.schema ||
          service.schema ||
          defaultPrismaOptions.schema,
        __cwd,
      ),
      output: ensureAbsolutePath(
        service.datasource?.output ||
          join(
            defaultPrismaOutput,
            `${__isMultiService ? service.name + '-' : ''}client`,
          ),
        __cwd,
      ),
    }
  } else {
    delete service.datasource
  }

  // APIs paths
  const items: Array<'graphql' | 'openapi'> = ['graphql', 'openapi']

  for (const item of items) {
    if (service[item] === false) {
      continue
    }

    const tmp = (typeof service[item] === 'boolean'
      ? {}
      : service[item]) as PathsObject

    service[item] = merge(tmp, defaults[item])

    service[item] = {
      ...((service[item] as PathsObject) || {}),
      output: ensureAbsolutePath(
        tmp?.output ||
          join(defaultApiOutput, __isMultiService ? service.name : '', item),
        __cwd,
      ),
      custom: ensureAbsolutePath(
        tmp?.custom ||
          `${src}/${item}${__isMultiService ? `/${service.name}` : ''}`,
        __cwd,
      ),
    }
  }

  if (service.__isMultiTenant) {
    service.tenants = service.tenants?.map((t) => ({
      ...t,
      name: t.name || defaults.tenantName,
    }))
  } else {
    delete service.tenants
  }

  const defaultConfig = JSON.parse(
    JSON.stringify(
      service.management ? defaultManagementConfig : defaultServiceConfig,
    ),
  )

  return merge(defaultConfig, service || {})
}
