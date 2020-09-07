import { FILTERING } from '../../constants'

export { modelTmpFn } from './{model}'
export { modelsTmpFn } from './models'

const TMP_DEFAULT_RESPONSE = `default: {
  description: 'Unexpected error',
  schema: {
    $ref: '#/definitions/Error'
  }
},`

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
// in "query", "header", "path", "formData", "body"
// type "string", "number", "integer", "boolean", "array", "file"
const parameters = {
  where: `{
    name: 'where',
    in: 'query',
    type: 'array',
    items: {
      type: "string",
    },
    required: false,
    description: 'Wraps all model fields in a type so that the list can be filtered by any property. Supported types "${FILTERING.join(
      '", "',
    )}". Example: id_in:1,2,3',
  },`,
  orderBy: `{
    name: 'orderBy',
    in: 'query',
    type: 'array',
    items: {
      type: "string",
      default: "name:asc"
    },
    required: false,
    description: 'Lets you order the returned list by any property. Example: name:asc,id:desc',
  },`,
  skip: `{
    name: 'skip',
    in: 'query',
    type: 'integer',
    required: false,
    description: 'Specifies how many of the returned objects in the list should be skipped.',
    default: 0,
  },`,
  take: `{
    name: 'take',
    in: 'query',
    type: 'integer',
    required: false,
    description: 'Specifies how many objects should be returned in the list (as seen from the beginning (+ve value) or end (-ve value) either of the list or from the cursor position if mentioned)',
    default: 10,
  },`,
  cursor: `{
    name: 'cursor',
    in: 'query',
    type: 'string',
    required: false,
    description: 'Specifies the position for the list (the value typically specifies an id or another unique value). Example: id:xxxx',
  },`,
  select: `{
    name: 'select',
    in: 'query',
    type: 'array',
    items: {
      type: "string",
    },
    required: false,
    description: 'Specifies which properties to include on the returned object, but not both at the same time. Example: id,name',
  },`,
  include: `{
    name: 'include',
    in: 'query',
    type: 'array',
    items: {
      type: "string",
    },
    required: false,
    description: 'Specifies which relations should be eagerly loaded on the returned object, but not both at the same time. Example: Post',
  },`,
}

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
      str += `${fn[key](parameters, ...params)}`.replace(
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
