import { join, dirname } from 'path'
import { log } from './logger'
import { exec, spawn } from 'child_process'
import findUp from 'find-up'

export const requireFromProject = (name: string, cwd = process.cwd()) => {
  try {
    return require(resolveFromProject(name, cwd))
  } catch (err) {
    const { message } = err
    if (message.includes('Cannot find module')) {
      const pkg = message.replace('Cannot find module', '')
      log.error(`Please install ${pkg.trim()}`)
      process.exit(1)
    }
    throw err
  }
}

export const resolveFromCurrent = (name: string) => {
  return require.resolve(name, {
    paths: [join(__dirname, '../../')],
  })
}

// v8.9.0+
export const resolveFromProject = (name: string, cwd = process.cwd()) => {
  return require.resolve(name, {
    paths: [
      cwd + '/node_modules/',
      cwd,
      ...(require.main?.paths || []),
      join(__dirname, '/../../../'),
    ],
  })
}

const strip = (str: string) =>
  str
    .split('/')
    .filter((x) => !!x && x !== '.')
    .join('/')

export const getTSConfig = (cwd = process.cwd()) => {
  return require(join(cwd, 'tsconfig.json'))
}

export const getSrcDirFromTSConfig = (cwd = process.cwd()) => {
  const config = getTSConfig(cwd)
  return strip(config?.compilerOptions?.rootDir || 'src')
}

export const getDistDirFromTSConfig = (cwd = process.cwd()) => {
  const config = getTSConfig(cwd)
  return strip(config?.compilerOptions?.outDir || 'dist')
}

let nodeModules: string
export const getNodeModules = (): string => {
  if (nodeModules) return nodeModules

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const findNodeModules = require('find-node-modules')
  nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  return nodeModules
}

export const getPrismaCliPath = (): string => {
  return resolveFromProject('@prisma/cli')
}

export const getPMTCliPath = async (): Promise<string> => {
  return await getBinPath('prisma-multi-tenant')
}

export const runShell = async (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string | undefined } },
): Promise<string | Buffer> => {
  if (process.env.verbose === 'true') {
    console.log('  $> ' + cmd)
  }

  return await new Promise((resolve, reject) => {
    exec(
      cmd,
      options,
      (
        error: Error | null,
        stdout: string | Buffer,
        stderr: string | Buffer,
      ) => {
        if (process.env.verbose === 'true') {
          console.log(stderr || stdout)
        }
        if (error) reject(error)
        resolve(stdout)
      },
    )
  })
}

export const spawnShell = async (cmd: string): Promise<number> => {
  const [command, ...commandArguments] = cmd.split(' ')
  return await new Promise((resolve) =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
    }).on('exit', (exitCode: number) => resolve(exitCode)),
  )
}

export const getPkgPath = (name: string) => {
  if (!name) {
    return ''
  }
  const pkgPath = resolveFromCurrent(name)
  if (!pkgPath) {
    return ''
  }
  return findUp('package.json', { cwd: pkgPath })
}

export const getPkgJson = async (name: string) => {
  const pkgPath = await getPkgPath(name)
  if (!pkgPath) {
    return null
  }
  return require(pkgPath)
}

export const getPkgJsonAndPath = async (name: string) => {
  const pkgPath = await getPkgPath(name)
  if (!pkgPath) {
    return null
  }
  return {
    json: require(pkgPath),
    path: pkgPath,
  }
}

export const getBinPath = async (name: string) => {
  const pkg = await getPkgJsonAndPath(name)
  if (!pkg) {
    return ''
  }
  const { json, path } = pkg
  if (!json || !path) {
    return ''
  }

  const { bin } = json
  if (typeof bin === 'string') {
    return bin
  }

  return join(dirname(path), bin[name])
}
