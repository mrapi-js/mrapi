import { Command } from 'commander'

import generate from './commands/generate'

const pkg = require('../package.json')

export const run = async () => {
  const program = new Command()

  program.storeOptionsAsProperties(false)

  program.version(pkg.version, '-v, --version')

  await generate(program)

  program.parse(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
