import chalk from 'chalk'
import path from 'path'
import commander from 'commander'

import { spawnShell, runShell } from '@mrapi/common'
import Command, { CommandParams } from './common'
import type { MrapiConfig } from '@mrapi/common'

class GenerateCommand extends Command {
  static params: CommandParams = {
    description: 'Generate prisma schema and nexus types',
    options: [
      {
        key: 'name',
        flags: ['--name <name>', 'schema client name'],
        required: true,
      },
    ],
  }

  async execute() {
    const { name } = this.argv
    const { schemaDir, outputDir } = this.mrapiConfig
    const cwd = process.cwd()
    const schemaPath = path.join(cwd, schemaDir, `${name}.prisma`)
    const outputPath = path.join(cwd, outputDir, name)

    // 1. Clean
    await runShell(`rm -rf ${outputPath}`)

    // 2. Generate PMT
    // TODO: spawnShell 存在 bug，在 pnpm 中使用时候，容易无法找到对应的依赖包
    const exitPMTCode = await spawnShell(
      `npx prisma-multi-tenant generate --schema ${schemaPath}`,
      {
        env: {
          ...process.env,
          PRISMA_CLIENT_OUTPUT: outputPath,
        },
      },
    )
    if (exitPMTCode !== 0) {
      throw new Error('Generate a multi-tenant exception.')
    }

    // 3. Generate CNT
    const exitCNTCode = await spawnShell(
      `npx cnt --schema ${schemaPath} --outDir ${path.join(
        outputPath,
        'nexus-types',
      )} -s -mq -m -q -f -o --js`,
    )
    if (exitCNTCode !== 0) {
      throw new Error('Generate nexus types exception.')
    }
  }
}

export default (program: commander.Command, mrapiConfig: MrapiConfig) => {
  const command = new GenerateCommand(
    program,
    GenerateCommand.params,
    mrapiConfig,
  )
  command.then(() => {
    console.log(
      chalk.green(
        `\n✅  Mrapi run ${command.name} "${command.argv.name}.prisma" successful.\n`,
      ),
    )
  })
}
