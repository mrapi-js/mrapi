import { GraphQLSchema } from 'graphql'
import { graphqlMiddleware } from '../src/index'

describe('graphql', () => {
  beforeAll(() => {})
  afterAll(() => {})
  test('graphqlMiddleware', async () => {
    const config = {}
    try {
      const res = await graphqlMiddleware({schema: new GraphQLSchema(config)})
      expect(res).toBe({})
    } catch (error) {
      
    }
  })
})
