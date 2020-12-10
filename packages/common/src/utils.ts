import { isAbsolute, join } from 'path'

export function tryRequire(
  name?: string,
  message?: string,
  resolveDefault = true,
) {
  if (!name) {
    return null
  }

  try {
    const mod = require(name)
    return resolveDefault ? mod?.default || mod : mod
  } catch (err) {
    if (message !== undefined) {
      const prefix = err.code === 'MODULE_NOT_FOUND' ? `Cannot find module '${name}'.` : ''
      if (message) {
        console.error(`Error: ${prefix} ${message}`)
        process.exit(1)
      } else {
        throw err
      }
    }
    return null
  }
}

export const resolveFile = (path: string): string => {
  let result = ''
  try {
    result = require.resolve(path)
  } catch {}
  return result
}

export const ensureEndSlash = (path: string) => {
  return path.endsWith('/') ? path : `${path}/`
}

export function ensureDepIsInstalled(depName: string) {
  try {
    require(depName)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error(`Please run \`npm install ${depName}\``)
      process.exit(1)
    } else {
      throw err
    }
  }
}

const prefixZero = (value: number): string => ('0' + value).slice(-2)

export function now(): string {
  const now = new Date()
  return `${now.getFullYear()}${prefixZero(now.getMonth() + 1)}${prefixZero(
    now.getDate(),
  )}${prefixZero(now.getHours())}${prefixZero(now.getMinutes())}${prefixZero(
    now.getSeconds(),
  )}`
}

/**
 * Converts Windows-style paths to Posix-style
 * C:\Users\Bob\dev\Redwood -> /c/Users/Bob/dev/Redwood
 *
 * The conversion only happens on Windows systems, and only for paths that are
 * not already Posix-style
 *
 * @param path Filesystem path
 */
export const ensurePosixPath = (path: string) => {
  let posixPath = path

  if (process.platform === 'win32') {
    if (/^[A-Z]:\\/.test(path)) {
      const drive = path[0].toLowerCase()
      posixPath = `/${drive}/${path.substring(3)}`
    }

    posixPath = posixPath.replace(/\\/g, '/')
  }

  return posixPath
}

export const ensureArray = <T>(x: unknown): T[] =>
  Array.isArray(x) ? x : [x].filter(Boolean)

export const ensureAbsolutePath = (path: string, cwd = process.cwd()) => {
  return isAbsolute(path) ? path : join(cwd, path)
}

export const getWorkspaceDirs = (cwd = process.cwd()) => {
  const tsconfigPath = join(cwd, 'tsconfig.json')
  const tsconifg = tryRequire(tsconfigPath)
  return {
    src: tsconifg?.compilerOptions?.rootDir || 'src',
    dst: tsconifg?.compilerOptions?.outDir || 'lib',
  }
}
