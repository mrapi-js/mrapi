import chalk from 'chalk'
import path from 'path'
import commander from 'commander'
import { readFileSync, outputFileSync } from 'fs-extra'

import { spawnShell, runShell, getUrlAndProvider } from '@mrapi/common'
import Command, { CommandParams } from './common'
import { Generator } from '../nexus-generator'
import type { MrapiConfig } from '@mrapi/common'

/**
 * https://paljs.com/cli/cnt/#command-options-for-cnt
 *
  -mq      add this option to create Queries and Mutations for models
  -m       add this option to create Mutations
  -q       add this option to create Queries
  -c       add this option to create Queries Count
  -f       add this option to add {filtering: true} option to Queries
  -o       add this option to add {ordering: true} option to Queries
 */
// const cntWhiteList = [
//   'mq',
//   // 'm', 'q',
//   'c',
//   'f',
//   'o',
// ]
// const cntWhiteListSet = new Set(cntWhiteList)

const tscOptions = [
  '-t es2018',
  '--lib esnext',
  '--module commonjs',
  '--moduleResolution node',
  '--allowSyntheticDefaultImports',
  '--esModuleInterop',
  '--importHelpers',
  '--resolveJsonModule',
  '--sourceMap false ',
  '--declaration',
  '--skipLibCheck',
].join(' ')

class GenerateCommand extends Command {
  static params: CommandParams = {
    description: 'Generate prisma schema and nexus types',
    options: [
      {
        key: 'name',
        flags: ['--name <name>', 'schema client name'],
        required: true,
      },
      // {
      //   key: 'cnt',
      //   flags: [
      //     '--cnt <options>',
      //     'Generate CNT params',
      //     cntWhiteList.join(','),
      //   ],
      // },
    ],
  }

  async execute() {
    const {
      name,
      // cnt
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

    // 4. Generate CRUD
    const palOutput = path.join(outputPath, 'nexus-types')
    await new Generator({
      schema: outputPath,
      output: palOutput,
    }).run()
    const exitPalCode = await spawnShell(
      `npx tsc ${tscOptions} ${palOutput}/*.ts ${palOutput}/**/*.ts ${palOutput}/**/**/*.ts`,
    )
    if (exitPalCode !== 0) {
      throw new Error('Generate nexus types exception.')
    }

    // // 4. Generate CNT
    // let cntParams = ''
    // cnt.split(',').forEach((item: string) => {
    //   if (cntWhiteListSet.has(item)) {
    //     cntParams += ` -${item}`
    //   }
    // })
    // const exitCNTCode = await spawnShell(
    //   `npx cnt --schema ${outputSchemaPath} --outDir ${path.join(
    //     outputPath,
    //     'nexus-types-cnt',
    //   )}${cntParams} -s --js`,
    // )
    // if (exitCNTCode !== 0) {
    //   throw new Error('Generate nexus types exception.')
    // }
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
