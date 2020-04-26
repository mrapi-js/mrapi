import { join } from 'path'
import * as fs from 'fs-extra'

export const create = async (targetDir: string, template = 'prisma-nexus') => {
  const files = join(__dirname, `../templates/${template}`)
  // copy files
  if (!(await fs.pathExists(files))) {
    console.error(`template "${template}" not exist`)
    process.exit()
  }
  await fs.copy(files, targetDir)
}
