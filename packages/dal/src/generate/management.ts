import { join } from 'path'
import { getNodeModules, runPrisma } from '@mrapi/common'
import { clientManagementPath } from '@prisma-multi-tenant/shared'

export default async function generateManagement(managementObj: {
  url: string
  provider: string
}) {
  const exitCode = await runPrisma('generate', {
    env: {
      ...process.env,
      MANAGEMENT_PROVIDER: managementObj.provider,
      MANAGEMENT_URL: managementObj.url,
      PMT_OUTPUT: join(await getNodeModules(), clientManagementPath),
    },
  })

  if (exitCode !== 0) {
    throw new Error('Generate a management exception.')
  }
}
