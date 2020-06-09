import { Context } from '@mrapi/core'
import { MiddlewareFn } from 'type-graphql'

export const LogAccessMiddleware: MiddlewareFn<Context> = async (
  { context, info },
  next,
) => {
  const { request } = context
  const prefix = 'GraphQL: '
  const apiName = `${info.parentType.name}.${info.fieldName}`
  const startTime = Date.now()
  request.log.info(`${prefix}-> ${apiName}`)
  try {
    await next()
    request.log.info(`${prefix}<- ${apiName} [${Date.now() - startTime} ms]`)
  } catch (error) {
    request.log.error(
      `${prefix}<- ${apiName} [${
        Date.now() - startTime
      } ms] ${error.toString()}`,
    )
    throw error
  }
}
