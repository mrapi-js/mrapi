import type mrapi from '@mrapi/types'
import type { OptionsData } from 'express-graphql'
import type { ExpressOpenAPIArgs } from 'express-openapi'
import type { MultiTenant } from '@prisma-multi-tenant/client'

declare module '@mrapi/types' {
  // extends types of mrapi.dal configs
  namespace dal {
    interface Options {
      logger?: mrapi.LoggerOptions // from @mrapi/common
    }

    interface GraphqlOptions extends OptionsData {}

    interface ServiceOptions {
      multiTenant?: MultiTenant<any>
    }

    interface OpenapiOptions {
      docs?: ExpressOpenAPIArgs & {
        app?: any
      }
    }
  }
}

export { mrapi }
