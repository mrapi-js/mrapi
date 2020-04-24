import { join } from 'path'
import { parseArgv } from './parse'
import { create } from './create'
import { install } from './install'

const run = async () => {
  const { dir, template } = parseArgv()

  const targetDir = join(process.cwd(), dir)

  await create(targetDir, template || 'prisma')
  console.log('Successfully created.')
  await install(targetDir)
  console.log('Successfully installed.')
}

run().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
