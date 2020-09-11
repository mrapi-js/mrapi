import chalk from 'chalk'
import path from 'path'
import commander from 'commander'
import {
  clientManagementPath,
  getNodeModules,
} from '@prisma-multi-tenant/shared'

import {
  spawnShell,
  runShell,
  getUrlAndProvider,
  readFileSync,
  writeFileSync,
} from '@mrapi/common'
import { Generator as NexusGenerate } from '@mrapi/nexus'
import { Generator as OASGenerate } from '@mrapi/oas'
import Command, { CommandParams } from './common'
import type { MrapiConfig, GeneratorOptions } from '@mrapi/common'

const cntWhiteList = ['disableQueries', 'disableMutations']
const cntWhiteListSet = new Set(cntWhiteList)

class GenerateCommand extends Command {
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
          `Generate CNT params. whiteList: ${cntWhiteList.join(',')}`,
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
    ],
  }

  async execute() {
    const { name, cnt, m, em, eqm } = this.argv
    const {
      inputSchemaDir,
      schemaDir,
      outputDir,
      managementUrl,
    } = this.mrapiConfig
    if (!managementUrl) {
      throw new Error('Please configure the "managementUrl".')
    }
    const managementObj = getUrlAndProvider(managementUrl)

    // Only generate management
    if (name === 'management') {
      await this.generateManagement(managementObj)
      return
    }

    const cwd = process.cwd()
    const inputSchemaPath = path.join(cwd, inputSchemaDir, `${name}.prisma`)
    const outputSchemaPath = path.join(cwd, schemaDir, `${name}.prisma`)
    const outputPath = path.join(cwd, outputDir, name)

    // 1. Clean
    await runShell(`rm -rf ${outputPath} ${outputSchemaPath}`)

    // 2. Generate schema.prisma
    writeFileSync(
      outputSchemaPath,
      this.createSchemaPrisma(outputPath, readFileSync(inputSchemaPath)),
    )

    // 3. Generate PMT
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
    const nexusParams: GeneratorOptions = {
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
    if (m) {
      nexusParams.models = m.split(',')
    }
    if (em) {
      em.split(',').forEach((item: string) => {
        nexusParams.excludeModels.push({
          name: item,
          queries: true,
          mutations: true,
        })
      })
    }
    if (eqm) {
      nexusParams.excludeQueriesAndMutations = eqm.split(',')
    }

    const nexusGenerate = new NexusGenerate(nexusParams)
    await nexusGenerate.run()
    await nexusGenerate.toJS()

    // 5. Generate CRUD with openAPI
    const oasOutput = path.join(outputPath, 'api')
    const oasParams: GeneratorOptions = {
      ...nexusParams,
      output: oasOutput,
    }
    const openAPIGenerate = new OASGenerate(oasParams)
    await openAPIGenerate.run()
  }

  createSchemaPrisma = (output: string, content: string) => `
generator client {
  provider = "prisma-client-js"
  output   = "${output}"
  previewFeatures = ["transactionApi"]
}

datasource db {
  provider = ["sqlite", "mysql", "postgresql"]
  url      = env("DATABASE_URL")
}

${content}
`

  async generateManagement(managementObj: { url: string; provider: string }) {
    const exitCode = await spawnShell('npx prisma generate', {
      env: {
        ...process.env,
        MANAGEMENT_PROVIDER: managementObj.provider,
        MANAGEMENT_URL: managementObj.url,
        PMT_OUTPUT: path.join(await getNodeModules(), clientManagementPath),
      },
    })
    if (exitCode !== 0) {
      throw new Error('Generate a management exception.')
    }
  }
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
