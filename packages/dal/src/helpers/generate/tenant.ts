import { runPrisma } from '@mrapi/common'

export default async function generateMultiTanent({
  targetSchema,
}: {
  targetSchema: string
}) {
  await runPrisma(` generate --schema=${targetSchema}`)
}
