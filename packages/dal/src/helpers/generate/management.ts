import type { mrapi } from '@mrapi/common'

import { runPrisma } from '@mrapi/common'

export default async function generateManagement(
  management: mrapi.ManagementObject,
) {
  const exitCode = await runPrisma(`generate --schema=${management.schema}`, {
    env: {
      ...process.env,
      MANAGEMENT_URL: management.database,
      // MANAGEMENT_PROVIDER: management.database.provider,
      MANAGEMENT_OUTPUT: management.prismaClient, // join(await getNodeModules(), clientManagementPath),
    },
  })

  if (exitCode !== 0) {
    throw new Error('Generate a management exception.')
  }
}
