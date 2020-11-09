import type { GraphQLSchema } from 'graphql'

import { tryRequire } from '@mrapi/common'

export async function getSchema({
  customPath,
  mock,
}: {
  customPath: string
  generatedPath: string
  datasourcePath: string
  contextFile: string
  plugins: string[]
  mock: any
}): Promise<GraphQLSchema> {
  const { buildSchema }: typeof import('type-graphql') = tryRequire(
    'type-graphql',
    'Please install it manually.',
  )

  const customResolvers = tryRequire(customPath)
  let schema

  try {
    schema = await buildSchema({
      resolvers: customResolvers,
    })
  } catch (err) {
    throw err
  }

  if (mock) {
    const {
      addMocksToSchema,
    }: typeof import('@graphql-tools/mock') = tryRequire(
      '@graphql-tools/mock',
      'You are using graphql mock, please install it manually.',
    )
    const mocks = typeof mock === 'object' ? mock : {}
    return addMocksToSchema({ schema, mocks })
  }

  return schema
}
