import { Datasource } from '../src/index'
import path from 'path'
import { Management } from '../src/management'

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

  test('types', async () => {
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
    console.log(db)
  })
})
