import type { mrapi } from '../../types'

import { runPrisma } from '@mrapi/common'

export default async function generatePrisma({
  paths,
}: {
  paths: mrapi.dal.PathObject
}) {
  await runPrisma(`generate --schema=${paths.outputSchema}`, {
    env: {
      DATABASE_URL: paths.database,
    },
  })
}
