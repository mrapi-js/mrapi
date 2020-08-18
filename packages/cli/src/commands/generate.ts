import commander from 'commander'

import Command, { CommandParams } from './common'

class GenerateCommand extends Command {
  static params: CommandParams = {
    description: 'Generate prisma schema and nexus types',
    options: [
      {
        key: 'schema',
        required: true,
        flags: ['--schema <path>', 'The schema path'],
      },
      {
        key: 'outDir',
        required: true,
        flags: ['--outDir <path>', 'The output directory'],
      },
    ],
  }

  execute() {
    console.log(`${this.name} argv =`, this.argv)
  }
}

export default async (program: commander.Command) => {
  const _command = new GenerateCommand(program, GenerateCommand.params)
}
