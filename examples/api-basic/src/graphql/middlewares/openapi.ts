import { GraphQLError } from 'graphql'

export default (next: any) => async (
  root: any,
  args: any,
  context: any,
  info: any,
) => {
  if (['Query', 'Mutation'].includes(info.parentType?.name)) {
    console.log('apiName:', info.fieldName)
  }
  const result = await next(root, args, context, info)
  return result
}
