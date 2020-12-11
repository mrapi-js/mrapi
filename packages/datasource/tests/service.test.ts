import { ServiceOptions } from '../lib/types'
import { Service } from '../lib/service'

describe('Service', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof Service).toBe('function')

    const instance = new Service(
      {
        name: 'a',
        database: 'file:./dev.db',
        clientPath: '.prisma/a-client',
      } as ServiceOptions,
      'prisma' as any,
    )
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(Service)
    ;[
      'getClient',
      'init',
      'createTenant',
      'deleteTenant',
      'getTenant',
      'connect',
      'disconnect',
    ].forEach((k) => {
      expect(typeof (instance as any)[k]).toBe('function')
    })
    expect(typeof instance.name).toBe('string')
    expect(typeof instance.tenants).toBe('object')
    expect(typeof instance.defaultTenantName).toBe('string')
  })
})
