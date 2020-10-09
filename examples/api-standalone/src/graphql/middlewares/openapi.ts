import { GraphQLError } from 'graphql'

class ResultError extends GraphQLError {
  constructor(message: any, code: any) {
    super(message, null, null, null, null, null, { code })
  }
}

export default (next: any) => async (
  root: any,
  args: any,
  context: any,
  info: any,
) => {
  console.log('apiName:', info.fieldName)
  const result = await next(root, args, context, info)

  if (typeof result !== 'object') {
    return result
  }

  const downstreamInfo = result._openAPIToGraphQL?.data
  if (downstreamInfo) {
    for (const [key, val] of Object.entries(downstreamInfo)) {
      const { url, responseHeaders } = val as any
      console.log(`${key}:`, { url, responseHeaders })
    }
  }

  if (!result.data && !result.message) {
    return result
  }

  // errorCode
  if (result.code * 1 !== 0) {
    throw new ResultError(result.message, result.code)
  }

  if (!result.data) {
    throw Error('no data')
  }

  // set headers
  context.reply.headers({
    'request-id': result.requestId || 0,
  })

  return result.data
}
