import type mrapi from '@mrapi/types'
import type { OptionsData } from 'express-graphql'
import type { ExpressOpenAPIArgs } from 'express-openapi'
import type { MultiTenant } from '@prisma-multi-tenant/client'

declare module '@mrapi/types' {
  // interface GraphqlOptions extends mrapi.dal.GraphqlOptions, OptionsData {}

  // interface OpenapiOptions extends mrapi.dal.OpenapiOptions {
  //   docs?: ExpressOpenAPIArgs & {
  //     app?: any
  //   }
  // }

  // interface ServerOptions extends mrapi.dal.ServerOptions {}

  // interface ServiceOptions extends mrapi.dal.ServiceOptions {
  //   graphql?: GraphqlOptions
  //   openapi?: OpenapiOptions
  //   multiTenant?: MultiTenant<any>
  // }

  // interface DALOptions extends mrapi.dal.Options {
  //   services: ServiceOptions[]
  //   logger?: mrapi.LoggerOptions
  //   pmtErrorThrow?: boolean
  // }

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
