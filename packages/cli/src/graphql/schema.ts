import mrapi from '@mrapi/types'

import chalk from 'chalk'
import { relative } from 'path'
import { merge, tryRequire } from '@mrapi/common'

export async function generateGraphqlSchema({
  schemaPath,
  graphqlOptions,
  clientOutput,
  databaseUrl,
}: {
  schemaPath: string
  graphqlOptions: mrapi.GraphqlOptions
  exitWithError: Function
  clientOutput: string
  databaseUrl: string
}) {
  const timeStart = Date.now()

  const { Generator }: typeof import('@paljs/generator') = tryRequire(
    '@paljs/generator',
    'Please install it manually.',
  )

  process.env.CLIENT_OUTPUT = clientOutput
  process.env.DATABASE_URL = databaseUrl

  console.log(chalk.dim`\nPrisma schema loaded from ${schemaPath}\n`)
  // TODO: make custom generator options work
  const opts = merge(
    {
      javaScript: true,
      output: graphqlOptions.output,
    },
    graphqlOptions.generatorOptions ?? {},
  )
  await new Generator(
    { name: 'nexus-plugin-prisma', schemaPath: schemaPath },
    opts,
  ).run()

  console.log(
    chalk`✔ Generated {bold GraphQL} {dim to ${relative(
      process.cwd(),
      graphqlOptions.output,
    )}} in ${Date.now() - timeStart}ms\n`,
  )
}
