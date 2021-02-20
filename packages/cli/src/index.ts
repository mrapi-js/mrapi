import type mrapi from '@mrapi/types'

import execa from 'execa'
import chalk from 'chalk'
import { basename, relative, dirname } from 'path'
import { resolveConfig, now } from '@mrapi/common'
import { generateContextFile } from './graphql/context'
import { generateGraphqlSchema } from './graphql/schema'
import { generateOpenapiSpecsFromPrisma } from './openapi'

const { version } = require('../package.json')
const SYMBOL_ALL = '.'

export class Cli {
  #helpText = `
Usage

  $ mrapi <command> [options]

Commands:

  setup            Setup
  prisma           Run prisma commands
  graphql          Generate GraphQL APIs base on prisma schema
  openapi          Generate OpenAPIs base on prisma schema

Options:

  -v, --version    Displays current version
  -h, --help       Displays this message
  --service        service name
  --tenant         tenant name

Examples:

  $ mrapi setup

  # Single tenant:
  $ mrapi prisma generate --service=post
  $ mrapi prisma migrate dev --preview-feature --service=post
  $ mrapi prisma db push --preview-feature --service=post
  $ mrapi prisma studio --service=post

  # Multiple tenant:
  $ mrapi prisma generate --service=user
  $ mrapi prisma migrate dev --preview-feature --service=user --tenant=one
  $ mrapi prisma db push --preview-feature --service=user --tenant=one
  $ mrapi prisma studio --service=user --tenant=one

  ## generate all services
  $ mrapi prisma generate --service=.
  $ mrapi prisma generate --tenant=.
  $ mrapi prisma generate --service=user --tenant=.

  $ mrapi prisma db push --preview-feature --service=user --tenant=two
  $ mrapi prisma studio --service=user --tenant=two

`

  #argv: string[]

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

        // await this.setup('prisma')
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
        await this.setup('graphql')

        break
      }
      case 'openapi': {
        await this.setup('openapi')
        break
      }
      default:
        this.exitWithError(`unknow command '${this.#argv[0]}'.`)
        break
    }
  }

  async setup(type?: string) {
    const services = this.getServiceConfig({
      service: '.',
      tenant: '.',
    })

    for (const service of services) {
      const name = service.name ? ' ' + service.name : ''
      this.log(chalk`{cyan Setting up{yellow ${name}} service...}`)

      const tenants = this.getTenantConfig(service)

      if (!type || type === 'prisma') {
        // generate PrismaClient for each service
        await this.runPrismaCommand(
          'prisma generate',
          service,
          tenants[0]?.database,
        )
      }

      // generate APIs for each service
      if (!type || type === 'graphql') {
        if ((service.graphql as mrapi.GraphqlOptions)?.output) {
          await this.runGraphqlGenerate(service, tenants[0])
        }
      }

      if (!type || type === 'openapi') {
        if (!service.openapi) {
          console.log(chalk.yellow`"openapi" not enabled in config file`)
        } else if (service.openapi?.output) {
          await this.runOpenapiGenerate(service)
        }
      }

      if (!type || type === 'prisma') {
        // migrate database for each tenant
        const databases = tenants.map((t) => t.database).filter(Boolean)
        const prismaVersion = this.prismaVersion
        const prismaVersionGreaterThan13 =
          prismaVersion[1] && prismaVersion[1] >= 13
        const migrateCmd = prismaVersionGreaterThan13
          ? 'prisma migrate dev --preview-feature --name=""'
          : 'prisma migrate save --experimental --create-db --name=""'

        for (const database of databases) {
          try {
            await this.runPrismaCommand(migrateCmd, service, database)
          } catch (err) {
            console.log(err)
            console.log(chalk.dim`migrate canceled`)
            continue
          }
          if (!prismaVersionGreaterThan13) {
            try {
              await this.runPrismaCommand(
                'prisma migrate up --experimental --create-db',
                service,
                database,
              )
            } catch (err) {
              console.log(err)
              console.log(
                chalk.dim`prisma migrate up --experimental --create-db canceled`,
              )
              continue
            }
          }
        }
      }
    }
  }

  async runPrismaCommand(
    cmdStr: string,
    service: mrapi.ServiceOptions,
    database?: string,
  ) {
    if (!service.datasource || service.datasource.provider !== 'prisma') {
      return
    }

    const databaseUrl = database || service.database
    const schemaPath = service.datasource?.schema
    const clientOutput =
      schemaPath && service.datasource?.output
        ? relative(dirname(schemaPath), service.datasource?.output ?? '')
        : ''

    this.log(
      `Running \`${cmdStr}\` ${
        this.isPrismaStudioCommand ? `on database \`${databaseUrl}\` ` : ''
      }...`,
    )
    const cmd = cmdStr + ` --schema=${service.datasource?.schema}`
    let stdout = ''

    try {
      const options: execa.Options = {
        shell: true,
        preferLocal: true,
        // prisma studio
        // stdio: cmd.includes('studio') ? 'inherit' : 'pipe',
        stdio: 'inherit',
        env: {
          CLIENT_OUTPUT: clientOutput,
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

    const pkgName = `.prisma/${
      service.datasource?.output
        ? basename(service.datasource.output)
        : 'client'
    }`

    // console
    if (stdout) {
      let message = ''
      for (const txt of stdout.split('\n')) {
        if (txt.includes('You can now start using')) {
          message += `${txt} import { PrismaClient } from '${pkgName}'\n`
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
    const databaseUrl = service.database || tenant?.database
    const schemaPath = service.datasource?.schema
    const graphqlOptions = service.graphql as mrapi.GraphqlOptions
    const clientOutput =
      schemaPath && service.datasource?.output
        ? relative(dirname(schemaPath), service.datasource?.output ?? '')
        : ''

    if (databaseUrl && schemaPath) {
      this.log('Running `mrapi graphql` ...')

      await generateGraphqlSchema({
        schemaPath,
        clientOutput,
        databaseUrl,
        graphqlOptions,
        exitWithError: this.exitWithError,
      })
    }

    // write context.ts file
    generateContextFile(
      service.contextFile,
      service.datasource?.output
        ? service.datasource.output.split('node_modules/')[1]
        : '',
    )
  }

  async runOpenapiGenerate(service: mrapi.ServiceOptions) {
    if (!service.datasource || !service.datasource?.output) {
      return
    }

    const openapiOptions = service.openapi as mrapi.OpenapiOptions

    if (!openapiOptions.output) {
      return
    }

    this.log('Running `mrapi openapi` ...')

    const { dmmf } = await import(service.datasource.output)

    if (!dmmf) {
      this.exitWithError('Please generate PrismaClient first')
    }

    console.log(chalk.dim`\nPrisma schema loaded from ${service.schema}\n`)
    const generatorOptions =
      openapiOptions.generatorOptions &&
      typeof openapiOptions.generatorOptions === 'object' &&
      Object.keys(openapiOptions.generatorOptions).length > 0
        ? openapiOptions.generatorOptions
        : {
            excludeFields: [],
            excludeModels: [],
            excludeFieldsByModel: {},
            excludeQueriesAndMutations: [],
            excludeQueriesAndMutationsByModel: {},
          }
    generateOpenapiSpecsFromPrisma(
      dmmf,
      openapiOptions.output,
      generatorOptions,
    )
  }

  private getServiceConfig(args = this.#args) {
    const config = resolveConfig()

    if (config.isMultiService && !args.service) {
      this.exitWithError(
        "You are using multi-service mode, please provide '--service=<service name>'",
      )
      return []
    }

    let services: mrapi.ServiceOptions[] = Array.isArray(config.service)
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
    let tenants: mrapi.TenantOptions[] =
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

  private get prismaVersion() {
    try {
      const { version } = require('prisma/package.json')
      return version.split('.').map((x: string) => Number(x))
    } catch {
      return ['2']
    }
  }

  private exitWithError(message: string) {
    console.log(chalk`{red Error:} ${message}`)
    process.exit()
  }

  private log(...messages: any[]) {
    console.log(chalk.dim(`[mrapi/cli]${now()}`), ...messages)
  }
}

export default async (argv = process.argv.slice(2)) => await new Cli(argv).run()

export const run = async (argv: string) => await new Cli(argv.split(' ')).run()
