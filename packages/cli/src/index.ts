import { loadConfig } from '@mrapi/core'
import { Command } from 'commander'

import db from './commands/db'
import generate from './commands/generate'

const pkg = require('../package.json')

export const run = async () => {
  const cwd = process.cwd()
  const program = new Command()

  program.storeOptionsAsProperties(false).passCommandToAction(false)

  program.version(pkg.version, '-v, --version')

  program
    .command('generate')
    .description('Generate prisma schema and resolvers')
    .action(async (options) => await generate(loadConfig(cwd), cwd, options))

  program
    .command('migrate')
    .description('Create a database migration (save|up|down)')
    .allowUnknownOption(true)
    .action(async (_, options) => {
      if (!options) {
        console.error('Please specify an action. e.g. save, up, down')
        process.exit(1)
      }
      await db.migrate(loadConfig(cwd), options.join(' '))
    })

  program
    .command('studio')
    .description('Start database management ui (default port: 5555)')
    .allowUnknownOption(true)
    .action(async (_, options) => {
      await db.studio(loadConfig(cwd), options ? options.join(' ') : '')
    })

  program
    .command('introspect')
    .description('Get the datamodel of your database')
    .allowUnknownOption(true)
    .action(async (_, options) => {
      await db.introspect(loadConfig(cwd), options ? options.join(' ') : '')
    })

  program
    .command('dev')
    .description('dev')
    .action((_cmdObj) => require('./commands/dev').default())

  program.on('command:*', function (operands) {
    console.error(`error: unknown command '${operands[0]}'`)
    const availableCommands = program.commands.map((cmd) => cmd.name())
    console.log(`Available Commands: ${availableCommands.join(' ')}`)
    process.exitCode = 1
  })

  await program.parseAsync(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
