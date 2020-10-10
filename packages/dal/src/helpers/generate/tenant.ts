import { runPrisma } from '@mrapi/common'

export default async function generateMultiTanent({
  // management,
  targetSchema,
}: {
  // management: {
  //   database: { url: string; provider: string }
  //   schema: string
  // }
  targetSchema: string
}) {
  // TODO: spawnShell 存在 bug，在 pnpm 中使用时候，容易无法找到对应的依赖包
  // const exitPMTCode = await spawnShell(
  //   `npx prisma-multi-tenant generate --schema ${targetSchema}`,
  //   {
  //     env: {
  //       // ...process.env,
  //       MANAGEMENT_PROVIDER: management.provider,
  //       MANAGEMENT_URL: management.url,
  //     },
  //   },
  // )
  // if (exitPMTCode !== 0) {
  //   throw new Error('Generate a multi-tenant exception.')
  // }

  // await runShell(`npx prisma-multi-tenant generate --schema=${targetSchema}`, {
  await runPrisma(` generate --schema=${targetSchema}`, {
    env: {
      ...process.env,
      // MANAGEMENT_URL: management.database.url,
      // MANAGEMENT_PROVIDER: management.database.provider,
    },
  })
}
