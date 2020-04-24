import { join } from 'path'
import * as fs from 'fs-extra'

export const create = async (targetDir: string, template = 'prisma-nexus') => {
  const files = join(__dirname, `../templates/${template}`)
  // copy files
  await fs.copy(files, targetDir)
}
