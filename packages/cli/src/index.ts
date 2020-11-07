import type mrapi from '@mrapi/types'

import execa from 'execa'
import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { join, basename, relative, dirname } from 'path'
import { resolveFile, resolveConfig, now } from '@mrapi/common'
import { genPaths, outputFile } from './openapi'

const { version } = require('../package.json')
const SYMBOL_ALL = '.'
interface IObjType {
  type: string
  properties: {
    [name: string]: {
      description: string
      type?: string
      schema?: any
      $ref?: any
      items?: any
    }
  }
  required?: string[]
}
// Reference URL: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat
function getFieldType(type: string) {
  const lowercaseType = type.toLowerCase()
  switch (lowercaseType) {
    case 'int':
      return 'integer'
    case 'string':
      return 'string'
    case 'boolean':
      return 'boolean'
    case 'datetime':
      return 'string'
    case 'float':
      return 'number'
    case 'null':
      return 'string'
    case 'json':
      return 'string'
  }
  throw new Error('Unknown field type. type: ' + type)
}

export class Cli {
  #helpText = `
Usage

  $ mrapi <command> [options]

Commands:

  setup            Setup
  prisma           Run prisma commands
  graphql          Generate GraphQL API base on prisma schema
  openapi          Generate OpenAPI base on prisma schema

Options:

  -v, --version    Displays current version
  -h, --help       Displays this message
  --service        service name
  --tenant         tenant name

Examples:

  $ mrapi setup

  # Single tenant:
  $ mrapi prisma generate --service=post
  $ mrapi prisma migrate save --experimental --create-db --name="" --service=post
  $ mrapi prisma migrate up --experimental --create-db --service=post
  $ mrapi prisma db push --ignore-migrations --preview-feature --service=post
  $ mrapi prisma studio --service=post

  # Multiple tenant:
  $ mrapi prisma generate --service=user
  $ mrapi prisma migrate save --experimental --create-db --name="" --service=user --tenant=one
  $ mrapi prisma migrate up --experimental --create-db --service=user --tenant=one
  $ mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=one
  $ mrapi prisma studio --service=user --tenant=one

  ## generate all services
  $ mrapi prisma generate --service=.
  $ mrapi prisma generate --tenant=.
  $ mrapi prisma generate --service=user --tenant=.

  $ mrapi prisma migrate up --experimental --create-db --service=user --tenant=two
  $ mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=two
  $ mrapi prisma studio --service=user --tenant=two

`

  #argv: Array<string>

  #args = {
    service: '',
    tenant: '',
  }

  #cmd = ''

  constructor(argv: string[] = process.argv.slice(2)) {
    this.#argv = argv
    this.parseArgs()
  }

  async run() {
    switch (this.#argv[0]) {
      case '-v':
      case '--version':
        console.log(version)
        break
      case '-h':
      case '--help':
        console.log(this.#helpText)
        break
      case 'setup':
        await this.setup()
        break
      case 'prisma': {
        if (
          this.#argv.some((x) =>
            ['-h', '--help', '-v', '--version'].includes(x),
          )
        ) {
          return execa.command(this.#cmd, {
            shell: true,
            stdout: 'inherit',
            preferLocal: true,
          })
        }

        const services = this.getServiceConfig()

        for (const service of services) {
          const tenants = this.getTenantConfig(service)
          for (const tenant of tenants) {
            await this.runPrismaCommand(this.#cmd, service, tenant.database)
          }
        }

        break
      }
      case 'graphql': {
        const services = this.getServiceConfig()

        for (const service of services) {
          if (service.graphql) {
            const tenants = this.getTenantConfig(service)
            await this.runGraphqlGenerate(service, tenants[0])
          }
        }
        break
      }
      case 'openapi': {
        const services = this.getServiceConfig()

        for (const service of services) {
          // management don't need graphql api generattion
          if (service.openapi) {
            await this.runOpenapiGenerate(
              {
                excludeFields: [],
                excludeModels: [],
                excludeFieldsByModel: {},
                excludeQueriesAndMutations: [],
                excludeQueriesAndMutationsByModel: {},
              },
              service,
            )
          }
        }
        break
      }
      default:
        this.exitWithError(`unknow command '${this.#argv[0]}'.`)
        break
    }
  }

  async setup() {
    const services = this.getServiceConfig({
      service: '.',
      tenant: '.',
    })

    for (const service of services) {
      this.log(
        chalk`{cyan Setting up{yellow ${`${
          service.name ? ' ' + service.name : ''
        } service`}}...}`,
      )

      const tenants = this.getTenantConfig(service)

      // generate PrismaClient for each service
      await this.runPrismaCommand(
        'prisma generate',
        service,
        tenants[0]?.database,
      )

      // generate APIs for each service
      if ((service.graphql as mrapi.GraphqlOptions)?.output) {
        await this.runGraphqlGenerate(service, tenants[0])
      }
      if ((service.openapi as mrapi.OpenapiOptions)?.output) {
        await this.runOpenapiGenerate(
          {
            excludeFields: [],
            excludeModels: [],
            excludeFieldsByModel: {},
            excludeQueriesAndMutations: [],
            excludeQueriesAndMutationsByModel: {},
          },
          service,
        )
      }

      // migrate database for each tenant
      const databases = tenants.map((t) => t.database).filter(Boolean)

      for (const database of databases) {
        try {
          await this.runPrismaCommand(
            'prisma migrate save --experimental --create-db --name=""',
            service,
            database,
          )
        } catch (err) {
          console.log(err)
          console.log(chalk.dim`migrate up canceled`)
          continue
        }
        await this.runPrismaCommand(
          'prisma migrate up --experimental --create-db',
          service,
          database,
        )
      }
    }
  }

  async runPrismaCommand(
    cmdStr: string,
    service: mrapi.ServiceOptions,
    database?: string,
  ) {
    if (!service.prisma) {
      this.exitWithError(
        `There is no prisma schema found. You cann't run prisma commands.`,
      )
    }

    const databaseUrl = database || service.database
    this.log(
      `Running \`${cmdStr}\` ${
        this.isPrismaStudioCommand ? `on database \`${databaseUrl}\` ` : ''
      }...`,
    )
    const cmd = cmdStr + ` --schema=${service.schema}`
    let stdout = ''

    try {
      const options: execa.Options = {
        shell: true,
        preferLocal: true,
        // prisma studio
        stdio: cmd.includes('studio') ? 'inherit' : 'pipe',
        env: {
          CLIENT_OUTPUT:
            service.schema && service.prisma?.output
              ? service.prisma?.output
              : '',
          DATABASE_URL: databaseUrl,
          // https://github.com/sindresorhus/execa/issues/69#issuecomment-278693026
          FORCE_COLOR: 'true',
        },
      }
      const proc = await execa.command(cmd, options)
      stdout = proc?.stdout
    } catch (err) {
      if (err.stdout) {
        console.log(err.stdout)
      }
      console.log(
        chalk`{bold Intend to operate on database} {red ${databaseUrl}}`,
      )
      throw err.stderr || err.message
    }

    let pkg
    if (service.prisma?.output) {
      // change package name
      const pkgPath = join(service.prisma?.output, 'package.json')
      pkg = require(pkgPath)
      pkg.name = `.prisma/${basename(service.prisma?.output!)}`
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    }

    // console
    if (stdout) {
      let message = ''
      for (const txt of stdout.split('\n')) {
        if (pkg && txt.includes('You can now start using')) {
          message += `${txt} import { PrismaClient } from '${pkg.name}'\n`
          break
        } else {
          message += `${txt}\n`
        }
      }
      console.log(message)
    }
  }

  async runGraphqlGenerate(
    service: mrapi.ServiceOptions,
    tenant?: mrapi.TenantOptions,
  ) {
    this.log(`Running \`mrapi graphql\` ...`)

    const generatorPath = resolveFile('@paljs/generator')
    if (!generatorPath) {
      this.exitWithError(`Please run 'npm i -D @paljs/generator' first.`)
    }

    const timeStart = Date.now()
    const {
      Generator,
    }: typeof import('@paljs/generator') = require(generatorPath)
    const graphqlOptions = service.graphql as mrapi.GraphqlOptions
    const schemaPath = service.prisma?.schema

    process.env.CLIENT_OUTPUT =
      schemaPath && service.prisma?.output
        ? relative(dirname(schemaPath), service.prisma?.output ?? '')
        : ''
    process.env.DATABASE_URL = service.database || tenant?.database

    console.log(chalk.dim`\nPrisma schema loaded from ${schemaPath}\n`)
    new Generator(
      { name: 'nexus-plugin-prisma', schemaPath: schemaPath! },
      {
        output: graphqlOptions.output,
        javaScript: true,
        disableQueries: false,
        disableMutations: false,
      },
    ).run()

    console.log(
      chalk`✔ Generated {bold GraphQL} {dim to ${relative(
        process.cwd(),
        graphqlOptions.output!,
      )}} in ${Date.now() - timeStart}ms\n`,
    )
  }

  async runOpenapiGenerate(
    options: any,
    service: mrapi.ServiceOptions,
    includeModels?: string[],
    excludeFields?: string[],
    excludeFieldsByModel?: { [modelName: string]: string[] },
  ) {
    this.log(`Running \`mrapi openapi\` ...`)
    const timeStart = Date.now()

    options['output'] = (typeof service.openapi !== 'boolean' &&
      service.openapi?.output) as string
    const { dmmf } = await import(service.prisma!.output!)

    if (!dmmf) {
      this.exitWithError('Please generate PrismaClient first')
    }
    console.log(chalk.dim`\nPrisma schema loaded from ${service.schema}\n`)

    const {
      datamodel,
      mappings,
      schema: { inputTypes, outputTypes },
    } = dmmf

    // Get the filtered models
    const models = outputTypes.filter(
      (model: any) =>
        !['Query', 'Mutation'].includes(model.name) &&
        !model.name.includes('Aggregate') &&
        model.name !== 'BatchPayload' &&
        (!includeModels || includeModels.includes(model.name as never)),
    )
    const allModelsObj: Record<string, any> = {}
    Array.isArray(datamodel.models) &&
      datamodel.models.forEach((model: any) => {
        allModelsObj[model.name] = model

        for (const field of model.fields) {
          if (field.isId) {
            allModelsObj[model.name].primaryField = field
            break
          }
        }
      })
    const modelDefinitions: any = {
      Error: {
        type: 'object',
        properties: {
          code: {
            description: 'Error code.',
            type: 'integer',
          },
          message: {
            description: 'Error message.',
            type: 'string',
          },
        },
      },
    }
    function dealModelDefinitions(inputType: any, hasObj: boolean = false) {
      const inputObj: IObjType = {
        type: 'object',
        properties: {},
        required: [],
      }

      inputType?.fields.forEach((field: any) => {
        const fieldInputType = Array.isArray(field.inputTypes)
          ? field.inputTypes.length >= 2
            ? field.inputTypes[1]
            : field.inputTypes[0]
          : field.inputTypes
        if (fieldInputType.kind === 'scalar') {
          const type = getFieldType(fieldInputType?.type)
          inputObj.properties[field.name] = {
            description: field.name,
            type,
          }
          fieldInputType?.isRequired && inputObj.required?.push(field.name)
        } else if (hasObj && fieldInputType.kind === 'object') {
          if (['AND', 'OR', 'NOT'].includes(field.name)) {
            inputObj.properties[field.name] = {
              type: 'array',
              description: `${fieldInputType.type} list.`,
              items: {
                type: 'object',
                description: fieldInputType.type,
                $ref: `#/definitions/${fieldInputType.type}`,
              },
            }
          } else {
            inputObj.properties[field.name] = {
              type: 'object',
              description: fieldInputType.type,
              $ref: `#/definitions/${fieldInputType.type}`,
            }
          }

          fieldInputType?.isRequired && inputObj.required?.push(field.name)
        }
      })

      if (inputObj.required && inputObj.required.length <= 0) {
        delete inputObj.required
      }

      modelDefinitions[inputType.name] = inputObj
    }

    // inputTypes
    // There's no filtering going on here
    inputTypes.forEach((inputType: any) => {
      if (/CreateInput$/.test(inputType.name)) {
        dealModelDefinitions(inputType)
      } else if (/WhereInput$/.test(inputType.name)) {
        dealModelDefinitions(inputType, true)
      } else if (/Filter$/.test(inputType.name)) {
        dealModelDefinitions(inputType)
      }
    })

    // outputTypes
    models.forEach((model: any) => {
      const obj: IObjType = {
        type: 'object',
        properties: {},
        required: [],
      }
      const fieldsToExclude = (excludeFields || []).concat(
        excludeFieldsByModel ? excludeFieldsByModel[model] : [],
      )

      model.fields.forEach((field: any) => {
        if (!fieldsToExclude.includes(field.name)) {
          if (field.outputType.kind === 'scalar') {
            const type = getFieldType(field.outputType?.type)
            obj.properties[field.name] = {
              description: field.name,
              type,
            }
            field.outputType?.isRequired && obj.required?.push(field.name)
          }
          // else if (field.outputType.kind === 'object') {
          //   obj.properties[field.name] = {
          //     type: 'object',
          //     description: field.name,
          //     $ref: `#/definitions/${field.name}`,
          //   }
          //   field.outputType?.isRequired && obj.required.push(field.name)
          // }
        }
      })

      if (obj.required && obj.required.length <= 0) {
        delete obj.required
      }

      modelDefinitions[model.name] = obj

      const mapping = mappings.modelOperations.find(
        (m: any) => m.model === model.name,
      )
      genPaths(options, model, mapping, allModelsObj[model.name])
    })

    outputFile(
      `module.exports = ${JSON.stringify(modelDefinitions)}`,
      join(options.output, 'definitions.js'),
    )

    console.log(
      chalk`✔ Generated {bold OpenAPI} {dim to ${relative(
        process.cwd(),
        options.output,
      )}} in ${Date.now() - timeStart}ms\n`,
    )
  }

  private getServiceConfig(args = this.#args) {
    const config = resolveConfig()

    if (config.__isMultiService && !args.service) {
      this.exitWithError(
        `You are using multi-service mode, please provide '--service=<service name>'`,
      )
      return []
    }

    let services: Array<mrapi.ServiceOptions> = Array.isArray(config.service)
      ? config.service
      : config.service
      ? [config.service]
      : []

    if (args.service && services.length === 1) {
      return services
    }

    if (args.service && args.service !== SYMBOL_ALL) {
      services = services.filter((s: any) => s.name === args.service)
    }

    if (services.length < 1) {
      this.exitWithError(
        `Cann't find '${args.service}' service in config file.`,
      )
    }

    return services
  }

  private getTenantConfig(service: mrapi.ServiceOptions) {
    let tenants: Array<mrapi.TenantOptions> =
      service.tenants ||
      (service.database
        ? [
            {
              name: 'default',
              database: service.database,
            },
          ]
        : [])

    if (this.#args.tenant) {
      tenants = tenants.filter((t) => t.name === this.#args.tenant)
    } else if (
      this.isPrismaStudioCommand &&
      Array.isArray(service.tenants) &&
      service.tenants?.length > 1
    ) {
      this.exitWithError(
        `Service '${service.name}' has multi-tenant, please provide '--tenant=<tenant name>'`,
      )
    }

    return tenants
  }

  private parseArgs() {
    this.#cmd = this.#argv
      .map((x) => {
        if (x.startsWith('--service')) {
          this.#args.service = x.split('=')[1]
          return null
        }
        if (x.startsWith('--tenant')) {
          this.#args.tenant = x.split('=')[1]
          return null
        }
        return x
      })
      .filter(Boolean)
      .join(' ')
  }

  private get isPrismaStudioCommand() {
    return this.#cmd.includes('studio')
  }

  private exitWithError(message: string) {
    console.log(chalk`{red Error:} ${message}`)
    process.exit()
  }

  private log(...messages: any[]) {
    console.log(chalk.dim(`[mrapi/cli]${now()}`), ...messages)
  }
}

export default new Cli().run().catch((err) => {
  console.error(err)
  process.exit(1)
})

export function run(argv: string) {
  return new Cli(argv.split(' ')).run()
}
