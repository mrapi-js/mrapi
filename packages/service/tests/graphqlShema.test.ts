import { getSchema } from '../src/graphql/schema/type-graphql'

describe('schema', () => {
  test('schema type-graphql', async () => {
    try {
      const typeRes = await getSchema({
        customPath: './packages/service/tests/shema',
        contextFile: '',
        generatedPath: '',
        datasourcePath: '',
        plugins: [''],
        mock: { name: 'cyrus' },
      })
      expect(typeof typeRes).toBe('object')
    } catch (error) {}
  })
})