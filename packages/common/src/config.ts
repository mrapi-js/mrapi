import type mrapi from '@mrapi/types'

import assert from 'assert'
import merge from 'deepmerge'
import { existsSync } from 'fs'
import { compileTSFile } from './ts'
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

const defaultServiceConfig: Partial<mrapi.ServiceOptions> = {}

// management is a special service which has no 'apiOutput'
const defaultManagementConfig: Partial<mrapi.ServiceOptions> = {
  ...defaultServiceConfig,
  managementTenantModelName: 'tenant',
}

export const defaults = {
  config: {
    cwd: process.cwd(),
    service: defaultServiceConfig,
    isMultiService: false,
  },
  clientPath: join(process.cwd(), 'node_modules/@prisma/client'),
  configFileName: 'mrapi.config',
  tenantName: 'default',
  serviceName: 'default',
  port: 1358,
  graphql: {
    playground: !isProd,
    generator: 'nexus' as mrapi.GraphqlGenerator,
  },
  openapi: false,
  multiTenant: {
    mode: 'seprate-db' as mrapi.MultiTenantMode,
    identity: 'mrapi-tenant-id',
  },
}

export function resolveConfig(
  input?: mrapi.PartialConfig | mrapi.Config,
  cwd = process.cwd(),
  configFileName = defaults.configFileName,
): mrapi.Config {
  if (input?.parsed) {
    return input as mrapi.Config
  }

  const maybeConfigPath =
    process.env.MRAPI_CONFIG_PATH ||
    join(cwd, configFileName || defaults.configFileName)
  const configPath = resolveConfigFilePath(maybeConfigPath)
  const tmp = configPath ? tryRequire(configPath) : {}
  const config: mrapi.PartialConfig = merge(
    {
      ...defaults.config,
      ...tmp,
    },
    (input || {}) as mrapi.Config,
  )
  const ServiceCwd = dirname(maybeConfigPath)
  const isMultiService = Array.isArray(config.service)
  const services: mrapi.PartialServiceOptions[] = config.service
    ? Array.isArray(config.service)
      ? config.service
      : [config.service]
    : []

  if (isMultiService) {
    const hasName = services.every(
      (val: mrapi.PartialServiceOptions) => !!val.name,
    )
    assert(
      hasName,
      "[Config Error] Multiple services should have 'name' fields on each.",
    )
  }

  const service = services.map((s: mrapi.PartialServiceOptions) =>
    normalizeServiceConfig(s, { isMultiService, cwd: ServiceCwd }),
  )

  return {
    ...config,
    service,
    isMultiService,
    cwd: ServiceCwd,
    parsed: true,
  }
}

function resolveConfigFilePath(configPath: string): string {
  const tsFile = configPath + '.ts'
  if (existsSync(tsFile)) {
    const destFile = compileTSFile(
      tsFile,
      ensureAbsolutePath(join(defaultApiOutput, 'config.js')),
    )

    return destFile
  }

  const jsFile = configPath + '.js'
  if (existsSync(jsFile)) {
    return jsFile
  }

  return ''
}

function normalizeServiceConfig(
  service: mrapi.PartialServiceOptions,
  { isMultiService, cwd }: { isMultiService: boolean; cwd: string },
): mrapi.ServiceOptions {
  service.name = service.name || defaults.serviceName

  if (service.tenants) {
    assert(
      Array.isArray(service.tenants),
      "[Config Error] 'service.tenants' should be an array ",
    )
  }

  const isMultiTenant = Array.isArray(service.tenants)

  // datasource paths
  const usingDatasource = service.datasource || service.schema
  const tenants = service.tenants as mrapi.TenantOptions[]
  if (usingDatasource) {
    const hasDatabase =
      !isMultiTenant || service.multiTenant?.mode === 'single-db'
        ? !!service.database
        : tenants.every((t) => !!t.database)
    assert(
      hasDatabase,
      `[Config Error] Service '${
        service.name
      }' using prisma, but no 'database' field configured. ${
        isMultiTenant && service.multiTenant?.mode === 'seprate-db'
          ? "Each tenant should configure 'database' field when using multi-tenant 'seprate-db' mode"
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
        cwd,
      ),
      output: ensureAbsolutePath(
        service.datasource?.output ||
          join(
            defaultPrismaOutput,
            `${isMultiService ? service.name + '-' : ''}client`,
          ),
        cwd,
      ),
    }
  } else {
    delete service.datasource
  }

  // custom source path
  service.customDir = ensureAbsolutePath(
    service.customDir || `${src}${isMultiService ? `/${service.name}` : ''}`,
  )
  const contextFile = join(service.customDir, 'context')

  if (isMultiTenant) {
    service.tenants = tenants.map((t) => ({
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

  return merge(defaultConfig, {
    ...service,
    ...(isMultiTenant
      ? {
          multiTenant: {
            ...defaults.multiTenant,
            ...service.multiTenant,
          },
        }
      : {}),
    graphql: normalizeGraphqlConfig(service, {
      isMultiService,
      cwd,
    }),
    openapi: normalizeOpenapiConfig(service, {
      isMultiService,
      cwd,
    }),
    contextFile,
  })
}

function normalizeGraphqlConfig(
  service: mrapi.PartialServiceOptions,
  { isMultiService, cwd }: { isMultiService: boolean; cwd: string },
): mrapi.GraphqlOptions | undefined {
  if (service.graphql === false) {
    return undefined
  }

  const tmp = (service.graphql || {}) as PathsObject
  const options = merge(defaults.graphql, tmp)

  return {
    ...options,
    output: ensureAbsolutePath(
      tmp.output ||
        join(defaultApiOutput, isMultiService ? service.name! : '', 'graphql'),
      cwd,
    ),
    custom: ensureAbsolutePath(join(service.customDir!, 'graphql'), cwd),
    playground: !!options.playground,
  }
}

function normalizeOpenapiConfig(
  service: mrapi.PartialServiceOptions,
  { isMultiService, cwd }: { isMultiService: boolean; cwd: string },
): mrapi.OpenapiOptions | undefined {
  if (!service.openapi) {
    return undefined
  }

  const tmp = service.openapi as PathsObject
  const options = merge(defaults.openapi, tmp)

  return {
    ...options,
    output: ensureAbsolutePath(
      tmp.output ||
        join(defaultApiOutput, isMultiService ? service.name! : '', 'openapi'),
      cwd,
    ),
    custom: ensureAbsolutePath(join(service.customDir!, 'openapi'), cwd),
  }
}
