import { Context } from '@mrapi/core'
import { MiddlewareFn } from 'type-graphql'

export const LogAccessMiddleware: MiddlewareFn<Context> = async (
  { context, info },
  next,
) => {
  const startTime = Date.now()
  const { request } = context
  const prefix = 'GraphQL: '
  const actionType = info.parentType.name
  const apiName = `${actionType}.${info.fieldName}`
  const needLog = ['Query', 'Mutation', 'Subscription'].includes(actionType)
  needLog && request.log.info(`${prefix}-> ${apiName}`)
  try {
    await next()
    needLog &&
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
