import { join } from 'path'
import { resolveConfig } from '../src/index'

const fixturesRoot = join(__dirname, './__fixtures__/config')

describe('Config', () => {
  beforeEach(() => {})

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
})
