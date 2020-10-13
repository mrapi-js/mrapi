import type { mrapi } from '@mrapi/common'
import type { PrismaClient } from '@prisma/client'
import type { OptionsData } from 'express-graphql'
import type { ExpressOpenAPIArgs } from 'express-openapi'

declare module '@mrapi/types' {
  namespace dal {
    interface Options {
      logger?: mrapi.LoggerOptions // from @mrapi/common
    }

    interface GraphqlOptions extends OptionsData {}

    interface OpenapiOptions {
      docs?: ExpressOpenAPIArgs & {
        app?: any
      }
    }
  }

  namespace db {
    interface Options {
      TenantClient?: PrismaClient
      ManagementClient?: PrismaClient
    }
  }
}

export { mrapi }
