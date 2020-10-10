import commander, { Command } from 'commander'

import generate from './commands/generate'
import migrate from './commands/migrate'

const pkg = require('../package.json')

export const run = async () => {
  let dal: any
  try {
    dal = require('@mrapi/dal')
  } catch (err) {
    throw new Error('please install "@mrapi/dal" manually')
  }

  const program: any = new Command()
  program.storeOptionsAsProperties(false)

  const commands = {
    generate,
    migrate,
  }

  for (const [name, cmd] of Object.entries(commands)) {
    registerCommand(program, cmd, dal[name].default || dal[name])
  }

  program.version(pkg.version, '-v, --version')

  program.parseAsync(process.argv)
}

function registerCommand(program: Command, cmd: any, executeFn: Function) {
  const command: commander.Command = program
    .command(cmd.name)
    .description(cmd.description)
    .action(async function (args) {
      await cmd.fn(args, command.opts(), executeFn)
    })

  for (const option of cmd.options) {
    command.option(option[0], option[1])
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
