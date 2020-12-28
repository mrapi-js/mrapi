import { join } from 'path'
import { resolveConfig, compileTSFile } from '../src/index'
const fixturesRoot = join(__dirname, './__fixtures__/config')
const dest =
  '/Users/clik/Documents/mrapi2.0/mrapi/node_modules/.mrapi/config.js'
describe('Config', () => {
  beforeEach(() => {})

  afterEach(() => {})
  test('compileTSFile()  not exists ', () => {
    const out = compileTSFile('not-exists.ts', dest)
    expect(out).toBe('')
  })
  test('compileTSFile() values exists ', () => {
    const cwd = join(fixturesRoot, 'configs')
    const config = resolveConfig({}, cwd, 'mrapi.config.basic')
    expect(typeof config).toBe('object')
  })
  test('compileTSFile() empty file', () => {
    const cwd = join(fixturesRoot, 'ts')
    const config = resolveConfig({}, cwd, 'empty-file')
    expect(typeof config).toBe('object')
  })

  test('compileTSFile()  not exists ', () => {
    const cwd = join(fixturesRoot, 'ts')
    const config = resolveConfig({}, cwd, 'not-exsits')
    expect(typeof config).toBe('object')
  })
  test('compileTSFile() dest is not exists', () => {
    const cwd = join(fixturesRoot, 'configs')
    const filePath = join(cwd, 'mrapi.config.basic.ts')
    const out1 = compileTSFile(
      filePath,
      '/Users/clik/Documents/mrapi2.0/mrapi/test-node_modules/not-exsits-dest.js',
    )
    expect(out1).toBe(
      '/Users/clik/Documents/mrapi2.0/mrapi/test-node_modules/not-exsits-dest.js',
    )
    const out2 = compileTSFile(
      filePath,
      '/Users/clik/Documents/mrapi2.0/mrapi/node_modules/not-exsits-dest.js',
    )
    expect(out2).toBe(
      '/Users/clik/Documents/mrapi2.0/mrapi/node_modules/not-exsits-dest.js',
    )
  })
})
