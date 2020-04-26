import { loadConfig, prismaUtils } from '@mrapi/core'
import { Command } from 'commander'
const pkg = require('../package.json')

export const run = async () => {
  const cwd = process.cwd()
  const config = loadConfig(cwd)

  const program = new Command()

  program.allowUnknownOption(true)

  program.version(pkg.version, '-v, --version')
  program
    .command('generate')
    .description('Generate DB Client code')
    .action(() => prismaUtils.generate(config, cwd))
  program
    .command('db:save [name]')
    .description('Create a migration with a specific name')
    .action((name) => prismaUtils.migrate.save(config, cwd, name))
  program
    .command('db:up [name/increment/timestamp]')
    .description('Migrate the database up to a specific state')
    .action((name) => prismaUtils.migrate.up(config, cwd, name))
  program
    .command('db:ui')
    .option('-p, --port <number>', 'The port number to start Studio on', '5555')
    .description('Start database management ui')
    .action((cmdObj) => prismaUtils.studio(config, cwd, cmdObj))

  program.parse(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
