import { join } from 'path'
import { tryRequire } from '../src/index'
import {
  ensureDepIsInstalled,
  ensureEndSlash,
  now,
  ensurePosixPath,
  ensureArray,
  ensureAbsolutePath,
  getWorkspaceDirs
} from './../src/utils'
const fixturesRoot = join(__dirname, './__fixtures__/config')
describe('Config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {})
  test('tryRequire() no name', () => {
    const out = tryRequire()
    expect(out).toBe(null)
  })
  test('tryRequire() message===undefined', () => {
    const out = tryRequire('test')
    expect(out).toBe(null)
  })
  test('tryRequire() process.exit(1) ', () => {
    const realProcess = process
    const exitMock: any = jest.fn()
    global.process = { ...realProcess, exit: exitMock }
    tryRequire('test', 'test-message')
    expect(exitMock).toHaveBeenCalled()
    global.process = realProcess
  })
  test('ensureEndSlash()  ', () => {
    //  ! endsWith '/'
    const out = ensureEndSlash('/test')
    expect(out).toBe('/test/')
    //   endsWith '/'
    const out1 = ensureEndSlash('/test/')
    expect(out1).toBe('/test/')
  })

  test('ensureDepIsInstalled() process.exit(1) ', () => {
    const realProcess = process
    const exitMock: any = jest.fn()
    global.process = { ...realProcess, exit: exitMock }
    ensureDepIsInstalled('test')
    expect(exitMock).toHaveBeenCalled()
    global.process = realProcess
  })
  test('ensureDepIsInstalled() exsits', () => {
    const cwd = join(fixturesRoot, 'configs', 'mrapi.config.basic')
    const out = ensureDepIsInstalled(cwd)
    expect(out).toBe(undefined)
  })
  test('ensureDepIsInstalled() err.code!=MODULE_NOT_FOUND', () => {
    const cwd = join(fixturesRoot, 'utils', 'mrapi.config.module-throw-error')
    try {
      ensureDepIsInstalled(cwd)
    } catch (error) {
      expect(error).toBe('error')
    }
  })
  test('now() ', () => {
    const out = now()
    expect(typeof out).toBe('string')
  })
  test('ensurePosixPath() platform=win32  ', () => {
    const realProcess = process
    const playformMock: any = jest.fn()
    global.process = { ...realProcess, platform: 'win32' }
    //  /^[A-Z]:\\/.test(path) =false
    const out = ensurePosixPath('test-path')
    expect(playformMock).not.toHaveBeenCalled()
    expect(out).toBe('test-path')
    //  /^[A-Z]:\\/.test(path) =true
    const out1 = ensurePosixPath('A:\\')
    expect(playformMock).not.toHaveBeenCalled()
    expect(out1).toBe('/a/')
    global.process = realProcess
  })
  test('ensureArray() ', () => {
      // params is an array
      const out=ensureArray([1,2,3])
      expect(out).toStrictEqual([1,2,3])
      // params is not an array
      const out1=ensureArray('string')
      expect(out1).toStrictEqual(["string"])
  });
  test('ensureAbsolutePath()',()=>{
    const absolutePath = join(fixturesRoot, 'configs', 'mrapi.config.basic')
    const cwd = join(fixturesRoot, 'configs')
    // path is absolute
    const out=ensureAbsolutePath(absolutePath)
    expect(out).toBe(absolutePath)
    // path is not absolute
    const out1=ensureAbsolutePath('test',cwd)
    expect(out1).toBe(join(cwd,'test'))
  })
  test('getWorkspaceDirs()  ', () => {
    const cwd = join(fixturesRoot, 'utils')
    // src-dst-not-exisits
    const path=join(cwd,'test.src-dst-exists.tsconfig.json')
    const out=getWorkspaceDirs(path)
    expect(out).toEqual({src:'src',dst:'lib'})
    // src-dst-exisits
    const out1=getWorkspaceDirs(cwd)
    expect(out1).toEqual({src:'/test/src',dst:"/test/out"})
  });
})
