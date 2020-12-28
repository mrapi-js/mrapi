import { join } from 'path'
import { resolveConfig, compileTSFile } from '../src/index'
import tempfile from 'tempfile'
const fixturesRoot = join(__dirname, './__fixtures__/config')

describe('Config', () => {
  beforeEach(() => {})

  afterEach(() => {})
  test('compileTSFile()  not exists ', () => {
    const randomConfig = tempfile('/config.js')
    const out = compileTSFile('not-exists.ts', randomConfig)
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
    const randomFile = tempfile('/test-node_modules/not-exsits-dest.js')
    const out1 = compileTSFile(filePath, randomFile)
    expect(out1).toBe(randomFile)
    const randomFile2 = tempfile('/node_modules/not-exsits-dest.js')
    const out2 = compileTSFile(filePath, randomFile2)
    expect(out2).toBe(randomFile2)
  })
})
