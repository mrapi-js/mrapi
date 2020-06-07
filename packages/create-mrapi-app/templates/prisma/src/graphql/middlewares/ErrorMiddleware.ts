import { Context } from '@mrapi/core'
import { MiddlewareFn } from 'type-graphql'

export const ErrorMiddleware: MiddlewareFn<Context> = async (
  { context },
  next,
) => {
  const { request, app } = context
  try {
    return await next()
  } catch (error) {
    app.log.error({
      error: error.toString(),
      reqId: request.id,
      body: request.body,
      cookies: request.cookies,
      params: request.params,
      query: request.query,
    })
    throw error
  }
}
