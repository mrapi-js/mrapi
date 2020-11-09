import chalk from 'chalk'
import { existsSync, writeFileSync } from 'fs'
import { join, relative } from 'path'

export function generateContextFile(
  targetDir?: string,
  datasourceModuleName?: string,
) {
  if (!targetDir || !existsSync(targetDir)) {
    return
  }

  const timeStart = Date.now()
  const contextFilePath = join(targetDir, 'context.ts')

  // create only if not exist
  if (!existsSync(contextFilePath)) {
    writeFileSync(
      contextFilePath,
      `import type { Request, Response } from '@mrapi/app'${
        !!datasourceModuleName
          ? `
import type { PrismaClient } from '${datasourceModuleName}'`
          : ''
      }

export interface Context {
  req: Request
  res: Response${
    !!datasourceModuleName
      ? `
  prisma: PrismaClient`
      : ''
  }
}`,
    )

    console.log(
      chalk`✔ Generated {bold Context} {dim to ${relative(
        process.cwd(),
        targetDir,
      )}} in ${Date.now() - timeStart}ms\n`,
    )
  }
}
