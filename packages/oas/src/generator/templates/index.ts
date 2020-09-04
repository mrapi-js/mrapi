export { modelTmpFn } from './{model}'
export { modelsTmpFn } from './models'

const TMP_DEFAULT_RESPONSE = `default: {
  description: 'Unexpected error',
  schema: {
    $ref: '#/definitions/Error'
  }
},`

export const getCrud = (
  fn: {
    [name: string]: Function
  },
  options: {
    GET?: boolean
    POST?: boolean
    PUT?: boolean
    DELETE?: boolean
  } = { GET: true, POST: true, PUT: true, DELETE: true },
  ...params: any[]
) => {
  const returnArr: string[] = []
  let str: string = ''
  for (const key in options) {
    if (fn[key] && options[key]) {
      returnArr.push(key)
      str += `${fn[key](...params)}`.replace(
        '#{TMP_DEFAULT_RESPONSE}',
        TMP_DEFAULT_RESPONSE,
      )
    }
  }
  return `
exports.default = function (mrapiFn) {
  ${str}
  return {
    ${returnArr.join(',')}
  }
}
`
}
