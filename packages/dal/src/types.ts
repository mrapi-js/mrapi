import type { mrapi } from '@mrapi/common'
import type { OptionsData } from 'express-graphql'
import type { PrismaClient } from '@prisma/client'
import type { ExpressOpenAPIArgs } from 'express-openapi'
import type { GraphQLSchema, ASTVisitor, ValidationContext } from 'graphql'

declare module '@mrapi/types' {
  namespace dal {
    interface Options {
      logger?: mrapi.LoggerOptions // from @mrapi/common
    }

    interface GraphqlOptions extends OptionsData {
      // make schema optional
      schema?: GraphQLSchema
      // make rules writable
      validationRules?: Array<(ctx: ValidationContext) => ASTVisitor>
    }

    interface OpenapiOptions {
      docs?: ExpressOpenAPIArgs & {
        app?: any
      }
    }

    type GetDBClientFn = (
      serviceName: string,
      tenantName?: string,
    ) => Promise<any>
  }

  namespace db {
    interface Options {
      TenantClient?: PrismaClient
      ManagementClient?: PrismaClient
    }
  }
}

export { mrapi }
