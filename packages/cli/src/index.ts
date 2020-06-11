import { loadConfig, prismaUtils } from '@mrapi/core'
import { join } from 'path'
import { Command } from 'commander'
import { watchFile, pathExists } from 'fs-extra'
const pkg = require('../package.json')

export const run = async () => {
  const cwd = process.cwd()
  const program = new Command()

  program.allowUnknownOption(true)

  program.version(pkg.version, '-v, --version')
  program
    .command('create')
    .description('Create prisma folder')
    .action(async () => {
      await prismaUtils.create(loadConfig(cwd), cwd)
    })
  program
    .command('generate')
    .description('Generate DB schema and resolvers')
    .option('-w, --watch', 'Watch file changes', false)
    .action(async () => {
      await prismaUtils.generate(loadConfig(cwd), cwd)

      const prismaFile = join(cwd, 'config/schema.prisma')

      if (await pathExists(prismaFile)) {
        watchFile(prismaFile, (curr, prev) => {
          console.log(`the current mtime is: ${curr.mtime}`)
          console.log(`the previous mtime was: ${prev.mtime}`)
        })
      }
    })
  program
    .command('db:save [name]')
    .description('Create a migration with a specific name')
    .action((name) => prismaUtils.migrate.save(loadConfig(cwd), cwd, name))
  program
    .command('db:up [name/increment/timestamp]')
    .description('Migrate the database up to a specific state')
    .action((name) => prismaUtils.migrate.up(loadConfig(cwd), cwd, name))
  program
    .command('db:ui')
    .option('-p, --port <number>', 'The port number to start Studio on', '5555')
    .description('Start database management ui')
    .action((cmdObj) => prismaUtils.studio(loadConfig(cwd), cwd, cmdObj))

  program
    .command('dev')
    .description('dev')
    .action((cmdObj) => require('./commands/dev').default())

  program.parse(process.argv)
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
