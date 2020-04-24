import { Mrapi, loadConfig, prismaUtils } from '@mrapi/core'

export const run = async () => {
  const cwd = process.cwd()
  const argv = process.argv.slice(2)
  console.log({ argv })
  const [rawPrimary, ...rawRest] = argv.join(' ').split(' -- ')
  const command = rawPrimary.trim().split(' ')[0]
  const secondary = rawRest.join(' -- ')

  const config = loadConfig(cwd)
  // const mrapi = new Mrapi()

  if (config.database.client === 'prisma') {
    // const prisma = await import('../utils/prisma')
    switch (command) {
      case 'generate':
        await prismaUtils.generate(config, cwd)
        break
      case 'migrate:save':
        await prismaUtils.migrate.save(config, cwd)
        break
      case 'migrate:up':
        await prismaUtils.migrate.up(config, cwd)
        break
      default:
        break
    }
  }
}

run()
  // .then(async () => {})
  .catch(async (err) => {
    console.error(err)
    process.exit(1)
  })
