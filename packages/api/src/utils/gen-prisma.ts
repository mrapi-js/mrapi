import { runShell } from '@mrapi/common'

export default async function (schemaNames: string[]) {
  /* eslint-disable */
  await Promise.all(
    schemaNames.map((name) => runShell(`npx mrapi generate --name ${name}`)),
  )
}
