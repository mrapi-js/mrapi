import type { mrapi } from '../../types'

import { runPrisma } from '@mrapi/common'

export default async function generatePrisma({
  paths,
  logger,
}: {
  paths: mrapi.dal.PathObject
  logger?: mrapi.Logger
}) {
  await runPrisma(`generate --schema=${paths.outputSchema}`, {
    env: {
      DATABASE_URL: paths.database,
    },
  })
}
