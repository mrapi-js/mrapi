import { Datasource } from '../src/index'
import path from 'path'
import { Management } from '../src/management'
import { Tenant } from '../src/tenant'

const configPath = path.join(
  __dirname,
  '__fixtures__/config/management.config.js',
)
const configPath2 = path.join(
  __dirname,
  '__fixtures__/config/services.config.js',
)
const config = require(configPath)
const config2 = require(configPath2)
describe('datasource', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('datasource', async () => {
    expect(typeof Datasource).toBe('function')
    const db = new Datasource(config)
    // constructor
    expect(db).toBeInstanceOf(Datasource)
    // initManagement
    expect(db.init()).toBeInstanceOf(Promise)
    expect(db.management).toBeInstanceOf(Management)

    // initServices
    const db2 = new Datasource(config2)
    expect(db2.init()).toBeInstanceOf(Promise)
    expect(db2.getServiceClient('default')).toBe(undefined)
    expect(await db2.disconnect()).toBe(undefined)
  })

  test('Tenant', async () => {
    expect(typeof Tenant).toBe('function')

    const instance = new Tenant(
      {
        name: 'x',
        database: 'file:./dev.db',
        clientPath: './__fixtures__/prisma',
      },
      'prisma' as any,
    )
    expect(typeof instance).toBe('object')
    expect(instance).toBeInstanceOf(Tenant)
    ;['getClient', 'connect', 'disconnect'].forEach(k => {
      expect(typeof (instance as any)[k]).toBe('function')
    })

    // instance
    expect(instance.name).toEqual('x')
    // expect(await instance.getClient()).toEqual({})
    // expect(instance.connect()).toEqual('123')
  })
})
