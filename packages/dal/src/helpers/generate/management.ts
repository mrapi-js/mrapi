import type { mrapi } from '@mrapi/common'

import { runPrisma } from '@mrapi/common'

export default async function generateManagement(
  management: mrapi.ManagementObject,
) {
  await runPrisma(`generate --schema=${management.schema}`, {
    env: {
      MANAGEMENT_URL: management.database,
      MANAGEMENT_OUTPUT: management.prismaClient,
    },
  })
}
