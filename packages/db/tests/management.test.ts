import { Management } from '../lib/management'

describe('Management', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof Management).toBe('function')

    const instance = new Management(
      {
        database: 'file:./dev.db',
        clientPath: '.prisma/management-client',
      },
      'prisma' as any,
    )
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(Management)
    ;[
      'getClient',
      'getTenant',
      'createTenant',
      'deleteTenant',
      'updateTenant',
      'connect',
      'disconnect',
      'checkClient',
    ].forEach((k) => {
      expect(typeof (instance as any)[k]).toBe('function')
    })
    expect(typeof instance.client).toBe('undefined')
    expect(typeof instance.provider).toBe('undefined')
  })
})
