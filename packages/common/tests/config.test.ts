import { join } from 'path'
import { resolveConfig } from '../src/index'

const fixturesRoot = join(__dirname, './__fixtures__/config')

describe('Config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV ='production'
  })

  afterEach(() => {})
  test('types', () => {
    expect(typeof resolveConfig).toBe('function')
  })

  test('no-config', () => {
    const cwd = join(fixturesRoot, 'no-config')
    const config = resolveConfig({}, cwd)
    expect(typeof config).toBe('object')

    expect(config).toMatchSnapshot()
  })

  test('basic', () => {
    const cwd = join(fixturesRoot, 'configs')
    const config = resolveConfig({}, cwd, 'mrapi.config.basic')

    expect(typeof config).toBe('object')
    expect(config).toMatchSnapshot()
  })

  test('multi-tenant', () => {
    const cwd = join(fixturesRoot, 'configs')
    const config = resolveConfig({}, cwd, 'mrapi.config.multi-tenant')

    expect(typeof config).toBe('object')
    expect(config).toMatchSnapshot()
  })

  test('multi-service', () => {
    const cwd = join(fixturesRoot, 'configs')
    const config = resolveConfig({}, cwd, 'mrapi.config.multi-service')

    expect(typeof config).toBe('object')
    expect(config).toMatchSnapshot()
  })

  test('disable-api', () => {
    const cwd = join(fixturesRoot, 'configs')
    const config = resolveConfig({}, cwd, 'mrapi.config.disable-api')

    expect(typeof config).toBe('object')
    expect(config).toMatchSnapshot()
  })

  test('no-database', () => {
    const cwd = join(fixturesRoot, 'configs')
    try {
      const config = resolveConfig({}, cwd, 'mrapi.config.no-database')
      console.log(JSON.stringify(config, null, 2))
    } catch (err) {
      expect(err.message).toContain(
        `using prisma, but no 'database' field configured`,
      )
    }
  })

  test('multi-service no-name', () => {
    const cwd = join(fixturesRoot, 'configs')
    try {
      resolveConfig({}, cwd, 'mrapi.config.no-name')
    } catch (err) {
      expect(err.message).toContain(
        `Multiple services should have 'name' fields on each`,
      )
    }
  })
  test('resolveConfig() input.parsed exsits', () => {
    const cwd = join(fixturesRoot, 'configs')
    // input.parsed exsits
    const out = resolveConfig({ parsed: true }, cwd, 'mrapi.config.basic')
    expect(out).toEqual({ parsed: true })
    const out1 = resolveConfig({ parsed: false }, cwd, 'mrapi.config.basic')
    expect(out1.parsed).toBeTruthy()
    const out2 = resolveConfig(undefined, cwd, 'mrapi.config.basic')
    expect(out2.parsed).toBeTruthy()
    //  existsSync(tsFile)
    try {
      const out1 = resolveConfig({}, cwd, 'this.is.no-match')
      expect(out1).toReturn()
      expect(out1.service.length).toBe(1)
      expect(out1.isMultiService).toBeFalsy()
      expect(typeof out1.cwd).toBe('string')
      expect(out1.parsed).toBeTruthy()
    } catch (error) {}
  })
  test('process.env.NODE_ENV ', () => {
    const cwd = join(fixturesRoot, 'configs')
    // production
    process.env.NODE_ENV ='production'
    const out=resolveConfig({}, cwd, 'mrapi.config.basic')
    expect(process.env.NODE_ENV).toBe('production')
    expect(typeof out).toBe('object')
    // null
    delete process.env.NODE_ENV
    const out2=resolveConfig({}, cwd, 'mrapi.config.basic')
    expect(process.env.NODE_ENV).toBeUndefined()
    expect(typeof out2).toBe('object')
    // test
    process.env.NODE_ENV='test'
    const out3=resolveConfig({}, cwd, 'mrapi.config.basic')
    expect(process.env.NODE_ENV).toBe('test')
    expect(typeof out3).toBe('object')
  })
  test('normalizeOpenapiConfig() service.tenants ', () => {
    const cwd = join(fixturesRoot, 'configs')
    // service.tenants is not an array
    const input:any={service:{tenants:'jfasnjs'}}
    try {
      resolveConfig(input, cwd, 'mrapi.config.basic')
    } catch (err) {
      expect(err.message).toContain(
        "[Config Error] 'service.tenants' should be an array ",
      )
    }
    // service.tenants is an array and it don't have db
    try {
      resolveConfig({service:{tenants:[{name:"string"}]}}, cwd, 'mrapi.config.basic')
    } catch (err) {
      expect(err.message).toContain(
        "[Config Error] Service 'default' using prisma, but no 'database' field configured. ",
      )
    }

    try {
      resolveConfig({service:{tenants:[{name:"string"}],multiTenant:{mode:'seprate-db'}}}, cwd, 'mrapi.config.basic')
    } catch (err) {
      expect(err.message).toContain(
        "Each tenant should configure \'database\' field when using multi-tenant \'seprate-db\' mode",
      )
    }
    
   
    
  })
  test('service.datasource.provider ', () => {
    const cwd = join(fixturesRoot, 'configs')
    const out= resolveConfig({}, cwd, 'mrapi.config.multi-tenant-db-provider')
    expect(typeof out).toBe('object')
    expect(typeof out.service).toBe('object')
    const out1= resolveConfig({}, cwd, 'mrapi.config.multi-tenant-true')
    expect(typeof out1).toBe('object')
    expect(typeof out1.service).toBe('object')
    // openapi is not exists
    const out2=resolveConfig({},cwd,'mrapi.config.openapi-is-false')
    expect(typeof out2).toBe('object')
  })
  test('resolveConfig no params ', () => {
      let nullValue:any
      const cwd = join(fixturesRoot, 'configs')
      const nullConfigFileName:any=null
      const notExistFileName='mrapi.config.not-exsits-file'
      const notExistConfigService='mrapi.config.no-config-service'
      const out= resolveConfig(nullValue)
      expect(typeof out).toBe('object')
      // test configFileName is null
      const out1=resolveConfig(nullValue,nullValue,nullConfigFileName)
      expect(typeof out1).toBe('object')
      // configFileName is not exist
      const out2=resolveConfig(nullValue,nullValue,notExistFileName)
      expect(typeof out2).toBe('object')
      const out3=resolveConfig(nullValue,cwd,notExistFileName)
      expect(typeof out3).toBe('object')
      // config-service is not exist
      const out4=resolveConfig(nullValue,cwd,notExistConfigService)
      expect(typeof out4).toBe('object')
  });
  test('no-schema', () => {
    const cwd = join(fixturesRoot, 'configs')
    const out= resolveConfig({},cwd,'mrapi.config.no-schema')
    expect(typeof out).toBe('object')
  });
    test('multi-tenant-no-name', () => {
      const cwd = join(fixturesRoot, 'configs')
    const out= resolveConfig({},cwd,'mrapi.config.multi-tenant-no-name')
    expect(typeof out).toBe('object')
    });
    test('openapi-multi-false', () => {
      const cwd = join(fixturesRoot, 'configs')
      const out= resolveConfig({},cwd,'mrapi.config.openapi-multi-false')
      expect(typeof out).toBe('object')
    });
})
