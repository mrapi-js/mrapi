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
type PROVIDER_TYPE = 'sqlite' | 'mysql' | 'postgresql';

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
    const inputSchemaFile = readFileSync(inputSchemaPath)
    const pureSchemaFile = this.getNoCommentContent(inputSchemaFile);
    const supportroviders: PROVIDER_TYPE[] = this.getCustomProvider(pureSchemaFile);

    // If primitive array occurs, provider can only be 'postgresql'.
    if (this.isScalarTypeArrayOccurs(pureSchemaFile)) {
      supportroviders.splice(0, supportroviders.length);
      supportroviders.push('postgresql');
    }

    // If 'Json' occurs, provider can not be 'sqlite'.
    if (
      supportroviders.includes('sqlite') &&
      this.isJsonTypeOccurs(pureSchemaFile)
    ) {
      supportroviders.splice(supportroviders.indexOf('sqlite'), 1);
    }

    // If 'enum' occurs, provider can not be 'sqlite'.
    if (
      supportroviders.includes('sqlite') &&
      this.isEnumTypeOccurs(pureSchemaFile)
    ) {
      supportroviders.splice(supportroviders.indexOf('sqlite'), 1);
    }

    // if there is no provider avaliable, throw error.
    if (supportroviders.length <= 0) {
      throw new Error('datasource provider can not be empty, please check if or not current connector can support this kind of grammer in your schema.')
    }

    writeFileSync(
      outputSchemaPath,
      this.createSchemaPrisma(outputPath, this.getNoDatasourceContent(inputSchemaFile), supportroviders),
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

  createSchemaPrisma = (
    output: string,
    content: string,
    provider: PROVIDER_TYPE[],
  ) => `
generator client {
  provider = "prisma-client-js"
  output   = "${output}"
  previewFeatures = ["transactionApi"]
}

datasource db {
  provider = [${provider.map((i) => `\"${i}\"`).join(', ')}]
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

  getCustomProvider(content: string): PROVIDER_TYPE[] {
    const providerPattern = /\s*provider\s*=\s*((.*)?)\n/ig;
    const matchStr = providerPattern.exec(content);

    if (matchStr !== null) {
      const customInput = JSON.parse(matchStr[1]);

      if (customInput instanceof Array) {
        return customInput;
      }

      return [ customInput as PROVIDER_TYPE ];
    }
    
    return [
      'sqlite',
      'mysql',
      'postgresql',
    ];
  }

  isScalarTypeArrayOccurs(content: string): boolean {

    // Judge whether or not enum array occurs.
    const enumDefined = new RegExp("\\s*enum\\s+(([a-z]*[A-Z]*)?)\\s*{","g");
    const enumTypeNameArr = [];
    let result;
    while ((result = enumDefined.exec(content)) != null)  {
      enumTypeNameArr.push(result[1].trim());
    }
    if (enumTypeNameArr.length !== 0) {
      if (this.isNormalTypeOccurs(content, "(" + enumTypeNameArr.join("|") + ")\\s*\\[\\]")) {
        return true;
      }
    }

    // Primitive array judgement.
    return this.isNormalTypeOccurs(content, "(Json|String|Boolean|Int|Float|DateTime)\\s*\\[\\]");
  }

  isJsonTypeOccurs(content: string): boolean {
    return this.isNormalTypeOccurs(content, "(Json\\s*\\[\\]|Json\\s+)");
  }

  isEnumTypeOccurs(content: string): boolean {
    return this.isNormalTypeOccurs(content, "enum\\s+");
  }

  isNormalTypeOccurs(content: string, patternStr: string): boolean {
    const pattern = new RegExp(".*" + patternStr,"g");

    const allMatch = pattern.exec(content)

    if (allMatch === null) {
      return false
    }

    return true;
  }

  // Remove comments from file content
  getNoCommentContent(content: string): string {
    const commentPattern = /\s*(\/){2,}.*/g;
    return content.replace(commentPattern, "");
  }

  // Remove custom datasource from file content
  getNoDatasourceContent(content: string): string {
    const datasourcePattern = /.*datasource\s+db([\s\S]*?)\}/g;
    return content.replace(datasourcePattern, "");
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
