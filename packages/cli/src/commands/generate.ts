import chalk from 'chalk'
import path from 'path'
import commander from 'commander'
import { readFileSync, outputFileSync } from 'fs-extra'

import { spawnShell, runShell, getUrlAndProvider } from '@mrapi/common'
import { Generator } from '@mrapi/nexus'
import Command, { CommandParams } from './common'
import type { MrapiConfig } from '@mrapi/common'
import type { Options as NexusOptions } from '@mrapi/nexus/lib/generator/types'

const cntWhiteList = ['disableQueries', 'disableMutations']
const cntWhiteListSet = new Set(cntWhiteList)

class GenerateCommand extends Command {
  static params: CommandParams = {
    description: 'Generate prisma schema and nexus types',
    options: [
      {
        key: 'name',
        flags: ['--name <name>', 'schema client name'],
        required: true,
      },
      {
        key: 'cnt',
        flags: [
          '--cnt <options>',
          `Generate CNT params. whiteList: ${cntWhiteList.join(',')}`,
        ],
      },
      {
        key: 'models',
        flags: ['--m <options>', 'Generate models'],
      },
      {
        key: 'excludeModels',
        flags: ['--em <options>', 'Exclude generate models'],
      },
      {
        key: 'excludeQueriesAndMutations',
        flags: ['--eqm <options>', 'Exclude Queries and Mutations'],
      },
    ],
  }

  async execute() {
    const {
      name,
      cnt,
      models,
      excludeModels,
      excludeQueriesAndMutations,
    } = this.argv
    const {
      inputSchemaDir,
      schemaDir,
      outputDir,
      managementUrl,
    } = this.mrapiConfig
    if (!managementUrl) {
      throw new Error('Please configure the "managementUrl".')
    }

    const cwd = process.cwd()
    const inputSchemaPath = path.join(cwd, inputSchemaDir, `${name}.prisma`)
    const outputSchemaPath = path.join(cwd, schemaDir, `${name}.prisma`)
    const outputPath = path.join(cwd, outputDir, name)

    // 1. Clean
    await runShell(`rm -rf ${outputPath} ${outputSchemaPath}`)

    // 2. Generate schema.prisma
    outputFileSync(
      outputSchemaPath,
      this.createSchemaPrisma(
        outputPath,
        readFileSync(inputSchemaPath, 'utf8'),
      ),
    )

    // 3. Generate PMT
    const managementObj = getUrlAndProvider(managementUrl)
    // TODO: spawnShell 存在 bug，在 pnpm 中使用时候，容易无法找到对应的依赖包
    const exitPMTCode = await spawnShell(
      `npx prisma-multi-tenant generate --schema ${outputSchemaPath}`,
      {
        env: {
          ...process.env,
          MANAGEMENT_PROVIDER: managementObj.provider,
          MANAGEMENT_URL: managementObj.url,
        },
      },
    )
    if (exitPMTCode !== 0) {
      throw new Error('Generate a multi-tenant exception.')
    }

    // 4. Generate CRUD with nexus
    const palOutput = path.join(outputPath, 'nexus-types')
    const nexusParams: NexusOptions = {
      schema: outputPath,
      output: palOutput,
      excludeFields: [],
      excludeModels: [],
      excludeFieldsByModel: {},
      excludeQueriesAndMutationsByModel: {},
      excludeQueriesAndMutations: [],
    }
    if (cnt) {
      cnt.split(',').forEach((item: string) => {
        if (cntWhiteListSet.has(item)) {
          nexusParams[item] = true
        }
      })
    }
    if (models) {
      nexusParams.models = models.split(',')
    }
    if (excludeModels) {
      excludeModels.split(',').forEach((item: string) => {
        nexusParams.excludeModels[item] = { name: item }
      })
    }
    if (excludeQueriesAndMutations) {
      nexusParams.excludeQueriesAndMutations = excludeQueriesAndMutations.split(
        ',',
      )
    }
    const nexusGenerate = new Generator(nexusParams)
    await nexusGenerate.run()
    await nexusGenerate.toJS()

    // TODO: 5. Generate CRUD with openAPI
    // ...
  }

  createSchemaPrisma = (output: string, content: string) => `
generator client {
  provider = "prisma-client-js"
  output   = "${output}"
}

datasource db {
  provider = ["sqlite", "mysql", "postgresql"]
  url      = env("DATABASE_URL")
}

${content}
`
}

export default (program: commander.Command, mrapiConfig: MrapiConfig) => {
  const command = new GenerateCommand(program, mrapiConfig)
  command.then(() => {
    console.log(
      chalk.green(
        `\n✅  Mrapi run ${command.name} "${command.argv.name}.prisma" successful.\n`,
      ),
    )
  })
}
