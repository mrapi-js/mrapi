import { spawnShell } from '@mrapi/common'

export default async function generateMultiTanent({
  managementObj,
  outputSchemaPath,
}: any) {
  // TODO: spawnShell 存在 bug，在 pnpm 中使用时候，容易无法找到对应的依赖包
  const exitPMTCode = await spawnShell(
    `npx prisma-multi-tenant generate --schema ${outputSchemaPath}`,
    {
      env: {
        ...process.env,
        MANAGEMENT_PROVIDER: managementObj.provider,
        MANAGEMENT_URL: managementObj.url,
      },
    },
  )
  if (exitPMTCode !== 0) {
    throw new Error('Generate a multi-tenant exception.')
  }
}
