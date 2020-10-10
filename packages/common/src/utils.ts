let nodeModules: string
export const getNodeModules = (fresh = false): string => {
  if (nodeModules && !fresh) return nodeModules

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const findNodeModules = require('find-node-modules')
  nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  return nodeModules
}

enum DBProvider {
  postgresql = 'postgresql',
  mysql = 'mysql',
  sqlite = 'sqlite',
}

export const getUrlAndProvider = (url: string) => {
  const _url = url.trim()
  if (!_url) {
    throw new Error('database url can not be empty')
  }
  const str = _url.split(':')[0]
  if (!str) {
    throw new Error(
      `unable to detect database database provider, received empty '${str}'`,
    )
  }

  let provider = ''
  switch (str) {
    case DBProvider.mysql:
      provider = DBProvider.mysql
      break
    case DBProvider.postgresql:
      provider = DBProvider.postgresql
      break
    case 'file':
      provider = DBProvider.sqlite
      break
    default:
      throw new Error(
        `Unrecognized '${str}' provider. Known providers: ${DBProvider.mysql}, ${DBProvider.postgresql}, ${DBProvider.sqlite}`,
      )
  }

  return {
    url: _url,
    provider,
  }
}

export const requireResolve = (path: string): string => {
  let result = ''
  try {
    result = require.resolve(path)
  } catch {}
  return result
}
