import type { mrapi } from '@mrapi/common'
import { Command } from 'commander'

import { resolveOptions } from './config'
import generate from './commands/generate'

const pkg = require('../package.json')

export const run = async () => {
  const program = new Command()

  // 暂时不开放设置配置文件路径
  const cliOptions: mrapi.cli.Options = resolveOptions()

  program.storeOptionsAsProperties(false)

  program.version(pkg.version, '-v, --version')

  generate(program, cliOptions)

  program.parse(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
