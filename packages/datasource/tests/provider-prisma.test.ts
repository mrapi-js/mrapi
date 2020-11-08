import PrismaProvider from '../lib/provider/prisma'

describe('Management', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof PrismaProvider).toBe('function')

    const instance = new PrismaProvider(
      {
        database: 'file:./dev.db',
        clientPath: '.prisma/management-client',
      },
      'prisma' as any,
    )
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(PrismaProvider)
    ;['get', 'model'].forEach((k) => {
      expect(typeof (instance as any)[k]).toBe('function')
    })
  })
})
