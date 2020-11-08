import type { Service } from '../'
import type { mrapi } from '../types'
import type { Datasource } from '@mrapi/datasource'
import type { Middleware20 } from 'swagger-tools'

import { join } from 'path'
import { tryRequire } from '@mrapi/common'
import { dependenciesPlugins } from './dependencies'

export async function makeOpenapi(
  app: Service,
  options: any = {},
  prefix: string,
) {
  const swagger: typeof import('swagger-tools') = tryRequire(
    'swagger-tools',
    'Please install it manually.',
  )
  const { initialize }: typeof import('express-openapi') = tryRequire(
    'express-openapi',
    'Please install it manually.',
  )

  const instance = initialize({
    ...options,
    app,
  })

  const endpoints = {
    api: prefix,
    swaggerUi: `${prefix}/docs`,
    apiDocs: `${prefix}/docs-json`,
  }

  await new Promise((resolve, reject) => {
    try {
      swagger.initializeMiddleware(
        instance.apiDoc,
        (middleware: Middleware20) => {
          // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-20
          app.use(prefix, middleware.swaggerMetadata())
          // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-validator
          app.use(middleware.swaggerValidator())
          // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-ui
          app.use(middleware.swaggerUi(endpoints))
          resolve(middleware)
        },
      )
    } catch (err) {
      reject(err)
    }
  })

  return {
    endpoints,
  }
}

export function makeOpenapiOptions(
  service: mrapi.ServiceOptions,
  getTenantIdentity: Function,
  datasource?: Datasource,
) {
  const openapiOutput = (typeof service.openapi !== 'boolean' &&
    service.openapi?.output) as string

  const definitions = tryRequire(join(openapiOutput, 'definitions'))

  if (!definitions) {
    return null
  }

  return {
    paths: join(openapiOutput, 'paths'),
    dependencies: {
      db: dependenciesPlugins(async (req: any, res: any) => {
        const tenantId: any = await getTenantIdentity(req, res, service)
        return datasource?.getServiceClient(service.name!, tenantId)
      }),
    },
    apiDoc: {
      swagger: '2.0',
      info: {
        title: `${service.name} OpenAPI Docs`,
        version: '1.0.0',
      },
      paths: {},
      definitions,
    },
  }
}
