import { Command } from 'commander'

import { getConfig } from '@mrapi/common'
import generate from './commands/generate'
import type { MrapiConfig } from '@mrapi/common'

const pkg = require('../package.json')

export const run = async () => {
  const program = new Command()

  // 暂时不开放设置配置文件路径
  const mrapiConfig: MrapiConfig = getConfig()

  program.storeOptionsAsProperties(false)

  program.version(pkg.version, '-v, --version')

  generate(program, mrapiConfig)

  program.parse(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
