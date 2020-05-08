import { join } from 'path'
import * as fs from 'fs-extra'
import { DBConfig, ServerConfig, SecurityConfig } from '../types'

export const loadConfig = (
  cwd: string,
  { server, database, security, rest },
) => {
  let serverConfig = server
  let databaseConfig = database
  let securityConfig = security
  let restConfig = rest

  if (!serverConfig) {
    const file = join(cwd, 'config/server.json')
    const exist = fs.existsSync(file)
    if (!exist) {
      throw Error('config/server.json is required')
    }
    serverConfig = require(file)
  }

  if (!databaseConfig) {
    const file = join(cwd, 'config/database.json')
    const exist = fs.existsSync(file)
    if (!exist) {
      throw Error('config/database.json is required')
    }
    databaseConfig = require(file)
  }

  if (!securityConfig) {
    const file = join(cwd, 'config/security.json')
    const exist = fs.existsSync(file)
    if (exist) {
      securityConfig = require(file)
    }
  }

  if (!restConfig) {
    const file = join(cwd, 'config/rest.json')
    const exist = fs.existsSync(file)
    if (exist) {
      restConfig = require(file)
    }
  }

  return {
    server: serverConfig as ServerConfig,
    database: databaseConfig as DBConfig,
    security: securityConfig as SecurityConfig,
    rest: restConfig,
  }
}

export const requireFromProject = (name: string, cwd = process.cwd()) => {
  try {
    return require(resolveFromProject(name, cwd))
  } catch (err) {
    const { message } = err
    if (message.includes('Cannot find module')) {
      const pkg = message.replace('Cannot find module', '')
      console.log(`Please install ${pkg.trim()}`)
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

export const checkPrismaClient = () => {
  // from prisma-beta.4, Prisma Client is now generated into a folder called node_modules/.prisma
  // https://github.com/prisma/prisma/releases/tag/2.0.0-beta.4
  try {
    const client = requireFromProject('.prisma/client')
    return !!client.prismaVersion
  } catch (err) {
    return false
  }
}

export const checkPrismaLocal = () => {
  return fs.pathExists(join(process.cwd(), 'prisma/schema.prisma'))
}

export const checkPrismaSchema = (database: any, cwd = process.cwd()) => {
  const schemaFilePath = join(
    cwd,
    database?.schemaOutput || 'prisma/schema.prisma',
  )
  return fs.pathExists(schemaFilePath)
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
