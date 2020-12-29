import { run } from '../src/index'

describe('packages cli test', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {})

  test('types2', async () => {
    // expect(null).toBe('11111')
    try {
      const a = await run('-v')
      console.log('a', a)
    } catch (error) {
      // expect(error).toBe("123")
      // console.log(error)
    }
  })
})
