import chalk from 'chalk'
import execa from 'execa'
import { join } from 'path'
import { promises as fs } from 'fs'

// const rootDir = process.cwd()
const packages = ['core', 'cli', 'create-mrapi-app']

async function getLatestVersion() {
  const childProcessResult = await execa.command('git describe --abbrev=0')
  const version = childProcessResult.stdout.toString()
  return version.startsWith('v') ? version.slice(1) : version
}

async function writeVersion(pkgDir: string, version: string, dryRun?: boolean) {
  const pkgJsonPath = join(pkgDir, 'package.json')
  const file = await fs.readFile(pkgJsonPath, 'utf-8')
  const packageJson = JSON.parse(file)
  if (dryRun) {
    console.log(
      `Would update ${pkgJsonPath} from ${
        packageJson.version
      } to ${version} now ${chalk.dim('(dry)')}`,
    )
  } else {
    packageJson.version = version
    await fs.writeFile(pkgJsonPath, JSON.stringify(packageJson, null, 2))
  }
}

async function getPackagesInfo(packages: string[]) {
  const info: Record<string, { name: string; path: string }> = {}

  for (let name of packages) {
    const pkgDir = join('packages', name)
    const pkg: any = require(join('../', pkgDir, 'package.json'))
    // const dependencies = pkg.dependencies
    // const devDependencies = pkg.devDependencies
    info[pkg.name] = {
      name: pkg.name,
      path: pkgDir,
    }
  }

  return info
}

/**
 * Runs a command and pipes the stdout & stderr to the current process.
 * @param cwd cwd for running the command
 * @param cmd command to run
 */
async function run(
  cwd: string,
  cmd: string,
  dry: boolean = false,
  hidden: boolean = false,
): Promise<void> {
  const args = [chalk.underline('./' + cwd).padEnd(20), chalk.bold(cmd)]
  if (dry) {
    args.push(chalk.dim('(dry)'))
  }
  if (!hidden) {
    console.log(...args)
  }
  if (dry) {
    return
  }

  try {
    await execa.command(cmd, {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        SKIP_GENERATE: 'true',
      },
    })
  } catch (e) {
    throw new Error(
      chalk.red(
        `Error running ${chalk.bold(cmd)} in ${chalk.underline(cwd)}:`,
      ) + (e.stderr || e.stack || e.message),
    )
  }
}

async function publish(dryRun: boolean) {
  if (dryRun) {
    console.log(
      chalk.blue.bold(`\nThe DRY_RUN env var is set, so we'll do a dry run!\n`),
    )
  }
  console.log(chalk.blueBright(`Publish order:`))
  console.log(
    chalk.blueBright(packages.map((o, i) => `  ${i + 1}. ${o}`).join('\n')),
  )
  const info = await getPackagesInfo(packages)
  const newVersion = await getLatestVersion()
  const tag = 'latest'

  for (let [name, obj] of Object.entries(info)) {
    console.log(
      `\nPublishing ${chalk.magentaBright(`${name}@${newVersion}`)} ${chalk.dim(
        `on ${tag}`,
      )}`,
    )
    await writeVersion(obj.path, newVersion, dryRun)
    await run(obj.path, `pnpm run build`, dryRun)
    await run(obj.path, `pnpm publish --no-git-checks --tag ${tag}`, dryRun)
  }
}

if (!module.parent) {
  publish(!!process.env.DRY_RUN).catch((e) => {
    console.error(chalk.red.bold('Error: ') + (e.stack || e.message))
    process.exit(1)
  })
}
