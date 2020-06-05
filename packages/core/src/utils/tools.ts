import { join } from 'path'
import { log } from './logger'

export const requireFromProject = (name: string, cwd = process.cwd()) => {
  try {
    log.warn(`requireFromProject ${name} from ${cwd}`)
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
      __dirname + '/../../../',
    ],
  })
}

const strip = (str: string) =>
  str
    .split('/')
    .filter((x) => !!x && x != '.')
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
