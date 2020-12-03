// import { mrapi } from '../../types'
import { GraphQLSchema } from 'graphql'
import { tryRequire } from '@mrapi/common'
import {
  getGraphqlSchema,
  getOpenapiSchema,
  resolverComposition,
  prefixTransform
} from './tools'

export async function getMeshSchema(sources: Array<any>): Promise<GraphQLSchema> {
  const { stitchSchemas } = tryRequire(
    '@graphql-tools/stitch',
    'Please install it manually.',
  )
  const schemas: Array<GraphQLSchema> = []
  const remoteSchemas: Array<GraphQLSchema | null> = await Promise.all(sources.map(c => {
    let fn: Promise<GraphQLSchema | null>
    switch(c.type) {
      case 'openapi':
        fn = getOpenapiSchema(c.endpoint, c.headers)
        break
      case 'graphql':
        fn = getGraphqlSchema(c.endpoint, c.headers)
        break
      default:
        fn = Promise.reject('mesh type error')
    }
    return fn.catch(err => {
      console.error(err)
      return null
    })
  }))

  remoteSchemas.forEach((schema, index) => {
    const { name, compositions, prefixTransforms } = sources[index]
    const subSchema: {[type: string]: any} = { schema: schema }

    // resolver composition
    if (compositions) 
      subSchema.schema = resolverComposition(
        name,
        schema as GraphQLSchema,
        compositions
      )

    // wrap and transform
    if (prefixTransforms)
      subSchema.transforms = prefixTransform(
        prefixTransforms.prefix,
        prefixTransforms.renameType,
        prefixTransforms.renameField,
        prefixTransforms.ignoreList,
      )

    if(subSchema.schema) {
      schemas.push(subSchema as GraphQLSchema)
    }
  })

  return stitchSchemas({
    subschemas: schemas
  })
}