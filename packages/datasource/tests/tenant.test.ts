import { Tenant } from '../lib/tenant'

describe('Tenant', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof Tenant).toBe('function')

    const instance = new Tenant(
      {
        name: 'x',
        database: 'file:./dev.db',
      },
      'prisma' as any,
    )
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(Tenant)
    ;['getClient', 'connect', 'disconnect'].forEach(k => {
      expect(typeof (instance as any)[k]).toBe('function')
    })
    expect(typeof instance.name).toBe('string')
    expect(typeof instance.client).toBe('undefined')
    expect(typeof instance.provider).toBe('undefined')
  })
})
