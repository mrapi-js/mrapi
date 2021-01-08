import chalk from 'chalk'
import { run } from '../src/index'
let oldLog = console.log
let consoleVal = ''

describe('packages cli test', () => {
  beforeEach(() => {
    jest.resetModules()
    console.log = function (str) {
      oldLog(str)
      consoleVal = str
    }
    process.env.MRAPI_CONFIG_PATH = './__fixtures__/config/mrapi.config.js'
  })

  afterEach(() => {
    consoleVal = ''
    process.env.MRAPI_CONFIG_PATH = undefined
    console.log = oldLog
  })

  afterAll(() => {})

  test('run -v', async () => {
    await run('-v')
    expect(consoleVal).toBe('2.0.1-beta.2')
  })

  test('run -h', async () => {
    await run('-h')
    expect(consoleVal).toBe(`
Usage

  $ mrapi <command> [options]

Commands:

  setup            Setup
  prisma           Run prisma commands
  graphql          Generate GraphQL APIs base on prisma schema
  openapi          Generate OpenAPIs base on prisma schema

Options:

  -v, --version    Displays current version
  -h, --help       Displays this message
  --service        service name
  --tenant         tenant name

Examples:

  $ mrapi setup

  # Single tenant:
  $ mrapi prisma generate --service=post
  $ mrapi prisma migrate dev --preview-feature --service=post
  $ mrapi prisma db push --ignore-migrations --preview-feature --service=post
  $ mrapi prisma studio --service=post

  # Multiple tenant:
  $ mrapi prisma generate --service=user
  $ mrapi prisma migrate dev --preview-feature --service=user --tenant=one
  $ mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=one
  $ mrapi prisma studio --service=user --tenant=one

  ## generate all services
  $ mrapi prisma generate --service=.
  $ mrapi prisma generate --tenant=.
  $ mrapi prisma generate --service=user --tenant=.

  $ mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=two
  $ mrapi prisma studio --service=user --tenant=two

`)
  })

  test('prisma -h', async () => {
    await run('prisma -h')
    expect(consoleVal).toBe('')
  })

  test('prisma init', async () => {
    await run('prisma init')
    expect(consoleVal).toBe('')
  })

  test('prisma studio --service=user --tenant=two', async () => {
    await run('prisma studio --service=user --tenant=two')
    expect(consoleVal).toEqual('')
  })

  test('setup error', async () => {
    await run('setup')
    expect(consoleVal).toEqual(
      chalk.yellow`"openapi" not enabled in config file`,
    )
  })
  test('prisma db', async () => {
    await run(
      'prisma db push --ignore-migrations --preview-feature --service=post',
    )
    expect(consoleVal).toEqual('')
    //TODO service 导入的情况
  })
})
