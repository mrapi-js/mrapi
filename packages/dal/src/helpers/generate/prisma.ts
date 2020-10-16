import type { mrapi } from '../../types'

import { runPrisma, fs } from '@mrapi/common'

export default async function generatePrisma({
  paths,
  logger,
}: {
  paths: mrapi.dal.PathObject
  logger?: mrapi.Logger
}) {
  if (!(await fs.pathExists(paths.outputSchema))) {
    logger.error(`prisma schema not found: ${paths.outputSchema}`)
    return
  }
  await runPrisma(`generate --schema=${paths.outputSchema}`, {
    env: {
      DATABASE_URL: paths.database,
    },
  })
}
