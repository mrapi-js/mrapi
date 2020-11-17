import type { app } from '@mrapi/app'

export function getRequestParams(req: app.Request) {
  const params = req.body || req.query

  if (!params) {
    throw new Error('No param found')
  }

  const query = typeof params.query === 'string' ? params.query : null

  let variables = params.variables
  if (typeof params.variables === 'string') {
    try {
      variables = JSON.parse(params.variables)
    } catch (err) {
      throw new Error('Variables are invalid JSON.')
    }
  }

  let operationName = params.operationName
  if (typeof params.operationName !== 'string') {
    operationName = null
  }

  return { query, variables, operationName }
}
