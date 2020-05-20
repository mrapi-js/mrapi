import { Context } from '@mrapi/core'
import { MiddlewareFn } from 'type-graphql'

export const ErrorMiddleware: MiddlewareFn<Context> = async (
  { context, info },
  next,
) => {
  const { request, reply, app } = context
  const { log } = app
  try {
    return await next()
  } catch (err) {
    if (info) {
      log.error('GraphQL:', info.operation?.operation, info.fieldName)
      console.log('cookies:', request.cookies)
      console.log('body:', request.body)
    }
    console.error(err)
    reply.send({
      errors: [{ message: err.message }],
      data: null,
    })
  }
}
