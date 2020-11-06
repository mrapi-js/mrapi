import { DB } from '..'

describe('db', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof DB).toBe('function')

    const instance = new DB({
      provider: 'prisma' as any,
      management: {
        database: 'file:./dev.db',
        clientPath: '.prisma/management-client',
      },
      services: [
        {
          name: 'a',
          database: 'file:./dev.db',
          clientPath: '.prisma/a-client',
        },
        {
          name: 'b',
          database: 'file:./dev.db',
          clientPath: '.prisma/b-client',
        },
      ],
    })
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(DB)
    ;['init', 'getManagementClient', 'getServiceClient', 'disconnect'].forEach(
      (k) => {
        expect(typeof (instance as any)[k]).toBe('function')
      },
    )
    expect(typeof instance.services).toBe('object')
    expect(typeof instance.management).toBe('undefined')
  })
})
