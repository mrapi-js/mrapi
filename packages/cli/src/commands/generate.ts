import type { mrapi } from '@mrapi/common'

import chalk from 'chalk'
import commander from 'commander'
import Command, { CommandParams } from './common'

class GenerateCommand extends Command {
  cwd = process.cwd()

  static params: CommandParams = {
    description: 'Generate prisma schema and nexus types',
    options: [
      {
        key: 'name',
        flags: [
          '--name <name>',
          'Schema client name. If the name is "management", Only generate management client.',
        ],
        required: true,
      },
      {
        key: 'cnt',
        flags: [
          '--cnt <options>',
          // `Generate CNT params. whiteList: ${cntWhiteList.join(',')}`,
        ],
      },
      {
        key: 'm',
        flags: ['--m <options>', 'Generate models'],
      },
      {
        key: 'em',
        flags: ['--em <options>', 'Exclude generate models'],
      },
      {
        key: 'eqm',
        flags: ['--eqm <options>', 'Exclude Queries and Mutations'],
      },
      {
        key: 'provider',
        flags: [
          '--provider <options>',
          // `Datasource provider list: ${datasourceProvider.join(',')}.`,
        ],
      },
    ],
  }

  async execute() {
    const { name, provider, cnt, m, em, eqm } = this.argv

    let generate
    try {
      const { generate: g } = require('@mrapi/dal')
      generate = g.default || g
      console.log(generate)
    } catch (err) {
      throw new Error('please install "@mrapi/dal" manually')
    }

    try {
      await generate({
        name,
        provider,
        options: { cnt, m, em, eqm },
      })
    } catch (err) {
      throw err
    }
  }
}

export default (program: commander.Command, options: mrapi.cli.Options) => {
  const command = new GenerateCommand(program, options)
  command.then(() => {
    console.log(
      chalk.green(
        `\n✅  Mrapi run ${command.name} "${command.argv.name}.prisma" successful.\n`,
      ),
    )
  })
}
