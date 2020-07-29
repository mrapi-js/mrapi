import { join } from 'path'
import { promises as fs } from 'fs'
import {
  pathExists,
  spawnShell,
  runPrisma,
  MrapiError,
  getNodeModules,
  getPrismaCliPath,
  runShell,
  Datasource,
} from '@mrapi/common'
import {
  Management,
  clientManagementPath,
  runDistantPrisma,
} from '@mrapi/multi-tenant'

const migrateActions = ['up', 'down', 'save']

const setManagementProviderInSchema = async () => {
  if (!process.env.MANAGEMENT_PROVIDER) {
    throw new MrapiError('missing-env', { name: 'MANAGEMENT_PROVIDER' })
  }

  const nodeModules = getNodeModules()

  // 1. Find schema file
  const schemaPath = join(
    nodeModules,
    'prisma-multi-tenant/build/cli/prisma/schema.prisma',
  )

  if (!(await pathExists(schemaPath))) {
    throw new MrapiError('management-schema-not-found')
  }

  // 2. Read content of file
  let content = await fs.readFile(schemaPath, 'utf8')

  // 3. Change provider of datasource
  content = content.replace(
    /datasource\s*management\s*{\s*provider\s*=\s*"([^"]*)"/,
    (match, p1) => {
      return match.replace(p1, process.env.MANAGEMENT_PROVIDER || '')
    },
  )

  // 4. Write content to file
  return fs.writeFile(schemaPath, content)
}

const setManagementProviderInMigration = async () => {
  if (!process.env.MANAGEMENT_PROVIDER) {
    throw new MrapiError('missing-env', { name: 'MANAGEMENT_PROVIDER' })
  }

  const nodeModules = getNodeModules()

  // 1. Find migration steps file
  const stepsPath = join(
    nodeModules,
    'prisma-multi-tenant/build/cli/prisma/migrations/20200526145455-beta/steps.json',
  )

  if (!(await pathExists(stepsPath))) {
    throw new MrapiError('management-migration-not-found')
  }

  // 2. Read content of file
  const content = JSON.parse(await fs.readFile(stepsPath, 'utf8'))

  // 3. Change provider of datasource
  content.steps.find(
    (step: any) => step.argument === 'provider',
  ).value = `"${process.env.MANAGEMENT_PROVIDER}"`

  // 4. Write content to file
  return fs.writeFile(stepsPath, JSON.stringify(content, null, 2))
}

const translateDatasourceUrl = (url: string): string => {
  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    return 'file:' + process.cwd() + '/prisma/' + url.replace('file:', '')
  }

  return url
}

const getManagementEnv = async (): Promise<{ [name: string]: string }> => {
  if (!process.env.MANAGEMENT_URL) {
    throw new MrapiError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  return {
    PMT_MANAGEMENT_URL: translateDatasourceUrl(process.env.MANAGEMENT_URL),
    PMT_OUTPUT: 'PMT_TMP',
  }
}

const runLocalPrisma = async (cmd: string): Promise<string | Buffer> => {
  const cmdStr = `"${getPrismaCliPath()}" ${cmd}`
  // return runLocal()
  const nodeModules = getNodeModules()
  const managementEnv = await getManagementEnv()

  // Fixes a weird bug that would not use the provided PMT_OUTPUT env
  delete process.env.INIT_CWD

  return await runShell(cmdStr, {
    cwd: join(nodeModules, 'prisma-multi-tenant/build/cli'),
    env: {
      ...process.env,
      ...managementEnv,
      PMT_OUTPUT: join(nodeModules, clientManagementPath),
    },
  })
}

class Generate {
  async run(args?: any) {
    if (!args || !args.options.watch) {
      console.log(
        '\n  Generating Prisma Clients for both management and tenants...',
      )

      // 1. Generate Tenants Prisma Client
      await this.generateTenants(args ? args.secondary : '')

      // 2. Generate Management Prisma Client
      await this.generateManagement(args ? args.secondary : '')

      console.log('\n✅  {green Prisma Clients have been generated!}\n')
    } else {
      console.log('\n  Generating Prisma Client for management')

      await this.generateManagement(args.secondary)

      console.log(
        '\n✅  {green Prisma Client for management has been generated!}\n',
      )

      console.log('\n  Generating and watching Prisma Client for tenants')

      await this.watchGenerateTenants(args.secondary)
    }
  }

  async generateTenants(prismaArgs: string = '') {
    await runPrisma(`generate ${prismaArgs}`)
  }

  async generateManagement(prismaArgs: string = '') {
    // This is a workaround until Prisma allows for multi-provider datasources
    await setManagementProviderInSchema()
    await setManagementProviderInMigration()

    await runLocalPrisma(`generate ${prismaArgs}`)
  }

  async watchGenerateTenants(prismaArgs: string = '') {
    await spawnShell(
      `npx @prisma/cli generate --watch ${prismaArgs}`,
    ).then((exitCode) => process.exit(exitCode))
  }
}

class Migrate {
  async run(args: any, management: Management) {
    const { name, action, migrateArgs, prismaArgs } = this.parseArgs(args)

    if (action === 'save') {
      // A. Save on default tenant
      if (!name) {
        console.log('\n  Saving migration with default tenant...\n')

        await this.migrateSave(management, undefined, migrateArgs, prismaArgs)

        console.log('\n✅  {green Successfuly saved the migration}\n')
        return
      }

      // B. Save on management
      if (name === 'management') {
        throw new MrapiError('cannot-migrate-save-management')
      }

      // C. Save on specific tenant
      console.log(`\n  Saving migration with tenant "${name}"...\n`)

      await this.migrateSave(management, name, migrateArgs, prismaArgs)

      console.log('\n✅  {green Successfuly saved the migration}\n')
    } else {
      // D. Migrate up or down on all tenants
      if (!name) {
        console.log(`\n  Migrating ${action} all tenants...\n`)

        await this.migrateAllTenants(
          management,
          action,
          migrateArgs,
          prismaArgs,
        )

        console.log(
          `\n✅  {green Successfuly migrated ${action} all tenants}\n`,
        )
        return
      }

      // E. Migrate up or down management
      if (name === 'management') {
        console.log(`\n  Migrating management ${action}...`)

        await this.migrateManagement(action, migrateArgs, prismaArgs)

        console.log(`\n✅  {green Successfuly migrated ${action} management}\n`)
        return
      }

      // F. Migrate up or down a specific tenant
      console.log(`\n  Migrating "${name}" ${action}...`)

      await this.migrateOneTenant(
        management,
        action,
        name,
        migrateArgs,
        prismaArgs,
      )

      console.log(`\n✅  {green Successfuly migrated ${action} "${name}"}\n`)
    }
  }

  parseArgs(args: any) {
    const [arg1, arg2, ...restArgs] = args.args

    let name
    let action
    let migrateArgs

    if (migrateActions.includes(arg2)) {
      name = arg1
      action = arg2
      migrateArgs = restArgs.join(' ')
    } else if (migrateActions.includes(arg1)) {
      action = arg1
      migrateArgs = [arg2, ...restArgs].join(' ')
    } else {
      throw new MrapiError('unrecognized-migrate-action', args)
    }

    return { name, action, migrateArgs, prismaArgs: args.secondary }
  }

  async migrateOneTenant(
    management: Management,
    action: string,
    name: string,
    migrateArgs: string = '',
    prismaArgs: string = '',
  ) {
    const tenant = await management.read(name)

    return await this.migrateTenant(action, tenant, migrateArgs, prismaArgs)
  }

  async migrateAllTenants(
    management: Management,
    action: string,
    migrateArgs: string = '',
    prismaArgs: string = '',
  ) {
    const tenants = await management.list()

    for (const tenant of tenants) {
      console.log(`    > Migrating "${tenant.name}" ${action}`)
      await this.migrateTenant(action, tenant, migrateArgs, prismaArgs)
    }
  }

  async migrateTenant(
    action: string,
    tenant?: Datasource,
    migrateArgs: string = '',
    prismaArgs: string = '',
  ) {
    return await runDistantPrisma(
      `migrate ${action} ${migrateArgs} ${prismaArgs} --experimental`,
      tenant,
    )
  }

  async migrateManagement(
    action: string,
    migrateArgs: string = '',
    prismaArgs: string = '',
  ) {
    return await runLocalPrisma(
      `migrate ${action} ${migrateArgs} ${prismaArgs} --experimental`,
    )
  }

  async migrateSave(
    management: Management,
    name?: string,
    migrateArgs: string = '',
    prismaArgs: string = '',
  ) {
    if (name) {
      const tenant = await management.read(name)
      process.env.DATABASE_URL = tenant.url
    }

    return await spawnShell(
      `npx @prisma/cli migrate save ${migrateArgs} ${prismaArgs} --experimental`,
    )
  }
}

class Studio {
  async run(args: any, management: Management) {
    const [name] = args.args
    const port = args.options.port || '5555'

    console.log(
      `\n  Studio started for tenant "${name}" at http://localhost:${port}\n`,
    )

    const tenant = await management.read(name)

    await runDistantPrisma(
      `studio --port ${port} ${args.secondary} --experimental`,
      tenant,
    )
  }
}

export const generate = new Generate()
export const migrate = new Migrate()
export const studio = new Studio()
