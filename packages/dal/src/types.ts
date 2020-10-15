import type { mrapi } from '@mrapi/common'
import type { GraphQLSchema } from 'graphql'
import type { OptionsData } from 'express-graphql'
import type { PrismaClient } from '@prisma/client'
import type { ExpressOpenAPIArgs } from 'express-openapi'

declare module '@mrapi/types' {
  namespace dal {
    interface Options {
      logger?: mrapi.LoggerOptions // from @mrapi/common
    }

    interface GraphqlOptions extends OptionsData {
      // make schema optional
      schema?: GraphQLSchema
    }

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
