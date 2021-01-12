import { join } from 'path'
import { run } from '../src/index'
const fixturesRoot = join(__dirname, './__fixtures__/config')
describe('packages cli test', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.setTimeout(30000)
    process.env.MRAPI_CONFIG_PATH = `${fixturesRoot}/mrapi.config`
  })

  afterEach(() => {
    process.env.MRAPI_CONFIG_PATH = undefined
  })

  afterAll(() => {})

  test('run -v', async () => {
    await run('-v').catch((e) => {
      console.error(e)
    })
  })

  test('run -h', async () => {
    await run('-h').catch((e) => {
      console.error(e)
    })
  })

  test('prisma -h', async () => {
    await run('prisma -h').catch((e) => {
      console.log(e)
    })
  })
  test('prisma init', async () => {
    await run('prisma init').catch((e) => {
      console.log(e)
    })
  })

  test('setup', async () => {
    await run('setup').catch((e) => {
      console.error(e)
    })
  })

  test('setup error', async () => {
    const realProcess = process
    global.process = {
      ...realProcess,
      env: {
        MRAPI_CONFIG_PATH: `${fixturesRoot}/mrapi.config-err-database`,
      },
    }
    await run('setup').catch((e) => {
      console.error(e)
    })
    global.process = realProcess
  })
  test('prisma db', async () => {
    await run(
      'prisma db push --ignore-migrations --preview-feature --service=post',
    ).catch((e) => {
      console.error(e)
    })

    //TODO service 导入的情况
  })
  test('graphql', async () => {
    await run('graphql').catch((e) => {
      console.error(e)
    })
  })
  test('openapi', async () => {
    await run('openapi').catch((e) => {
      console.error(e)
    })
  })
  test('error', async () => {
    const realProcess = process
    const exitMock: any = jest.fn()
    global.process = { ...realProcess, exit: exitMock }
    await run('error').catch((e) => {
      console.error(e)
    })
    expect(exitMock).toHaveBeenCalled()
    global.process = realProcess
  })
  // test('prisma Version', async () => {
  //   await run('setup').catch((e) => {
  //     console.error(e)
  //   })
  // }, 999999)
})
