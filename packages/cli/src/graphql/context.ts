import chalk from 'chalk'
import { existsSync, writeFileSync } from 'fs'
import { dirname, extname, relative } from 'path'

export function generateContextFile(
  contextFile?: string,
  datasourceModuleName?: string,
) {
  if (!contextFile || !existsSync(dirname(contextFile))) {
    return
  }

  const contextFilePath =
    extname(contextFile) === '' ? contextFile + '.ts' : contextFile

  const timeStart = Date.now()

  // create only if not exist
  const relativePath = relative(process.cwd(), contextFilePath)
  if (!existsSync(contextFilePath)) {
    writeFileSync(
      contextFilePath,
      `import type { mrapi } from '@mrapi/service'${
        datasourceModuleName
          ? `
import type { PrismaClient } from '${datasourceModuleName}'`
          : ''
      }

export interface Context {
  req: mrapi.Request
  res: mrapi.Response${
    datasourceModuleName
      ? `
  prisma: PrismaClient`
      : ''
  }
}

/**
 * Create custom context function
 * You can extend or overwrite default values: {req, res, prisma}
 * @export
 * @param {mrapi.CreateContextParams} _params
 * @returns {Partial<Context>}
 */
export function createContext(
  _params: mrapi.CreateContextParams,
): Partial<Context> {
  return {}
}
`,
    )

    console.log(
      chalk`✔ Generated {bold Context} {dim to ${relativePath}} in ${
        Date.now() - timeStart
      }ms\n`,
    )
  } else {
    console.log(
      chalk.dim`{bold Context} file '${relativePath}' already exist. skip.\n`,
    )
  }
}
