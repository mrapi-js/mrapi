import type { mrapi } from '@mrapi/service'
import { PrismaClient } from '.prisma/user-client'

export interface Context {
  req: mrapi.Request
  res: mrapi.Response
  prisma: PrismaClient
  userId: number
}

/**
 * Create custom context function
 * You can extend or overwrite default values: {req, res, prisma}
 * @export
 * @param {mrapi.CreateContextParams} _params
 * @returns {Partial<Context>}
 */
export function createContext(
  params: mrapi.CreateContextParams,
): Partial<Context> {
  // console.log(
  //   '-->1',
  //   params.req.body.operationName,
  //   (params as any).prisma._middlewares,
  // )
  // if (params.req.body.operationName !== 'IntrospectionQuery') {
  //   const tenantId = params.req.headers['mrapi-tenant-id'] as string
  //   applyPrismaTenantMiddleware((params as any).prisma, tenantId)
  // }
  return {
    userId: 1,
  }
}

const tenantFieldName = 'tenantId'

function applyPrismaTenantMiddleware(
  prisma: PrismaClient,
  tenantId: string,
  excludeModels?: string[],
) {
  prisma.$use(async (params, next) => {
    let result

    if (
      !params.model ||
      (excludeModels && excludeModels.includes(params.model)) ||
      params.action === 'delete'
    ) {
      result = await next(params)
    }

    if (!result && ['create', 'update'].includes(params.action)) {
      params.args.data = {
        ...params?.args?.data,
        [tenantFieldName]: tenantId,
      }

      result = await next(params)
    }

    if (!result) {
      if (!params?.args) {
        params = { ...params, args: {} }
      }

      if (!params?.args?.where) {
        params = { ...params, args: { ...params.args, where: {} } }
      }

      if (params.action === 'findOne') {
        params.action = 'findFirst'

        params.args.where = Object.keys(params.args.where).reduce(
          (prev, next) => {
            return { ...prev, [next]: { equals: params.args.where[next] } }
          },
          {},
        )
      }

      if (params?.args?.where?.AND) {
        params.args.where = {
          AND: [
            { [tenantFieldName]: { equals: tenantId } },
            ...params.args.where.AND,
          ],
        }
      } else {
        if (
          params?.args?.where &&
          Object.keys(params?.args?.where).length > 0
        ) {
          params.args.where = {
            AND: [
              { [tenantFieldName]: { equals: tenantId } },
              ...Object.keys(params.args.where).map((key) => ({
                [key]: params.args.where[key],
              })),
            ],
          }
        } else {
          params.args.where = {
            [tenantFieldName]: { equals: tenantId },
          }
        }
      }

      result = await next(params)
    }

    ;(prisma as any)._middlewares.pop()

    console.log('<--', (prisma as any)._middlewares)
    return result
  })
}
