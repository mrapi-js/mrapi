import { Context } from '@mrapi/core'
import { MiddlewareFn } from 'type-graphql'

export const ErrorInterceptor: MiddlewareFn<Context> = async (
  { context, info },
  next,
) => {
  const { log } = context.app
  try {
    return await next()
  } catch (err) {
    if (info?.operation) {
      log.error(
        `operation => ${info.operation.operation} ${info.operation.name?.value}`,
      )
    }
    log.error(err)
    throw err
  }
}
