import { join } from 'path'
import { pathExists } from 'fs-extra'
import { getSrcDirFromTSConfig, getDistDirFromTSConfig } from './tools'

export const getCustomRoutes = async (config: any, cwd = process.cwd()) => {
  if (!config.custom || !config.custom.path) {
    return []
  }
  const isDev = process.env.NODE_ENV !== 'production'
  const src = getSrcDirFromTSConfig()
  const dist = getDistDirFromTSConfig()
  const customDir = isDev
    ? config.custom.path
    : config.custom.path.replace(src, dist)
  if (await pathExists(customDir)) {
    const routes = require(join(cwd, customDir))
    return routes.default || routes
  }

  return []
}
