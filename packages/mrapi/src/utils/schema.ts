import { join } from 'path'
import { buildSchema } from 'type-graphql'
import { getSrcDirFromTSConfig, getDistDirFromTSConfig } from './tools'

export const createSchema = (config: any, cwd: string) => {
  const isDev = process.env.NODE_ENV !== 'production'
  const src = getSrcDirFromTSConfig()
  const dist = getDistDirFromTSConfig()
  const generatedDir = isDev
    ? config.resolvers.generated.replace('../', '')
    : config.resolvers.generated.replace(`../${src}`, dist)

  const crudFilePath = join(
    cwd,
    generatedDir,
    'resolvers/crud/**/*CrudResolver.{ts,js}',
  )
  const relationFilePath = join(
    cwd,
    generatedDir,
    'resolvers/relations/**/*RelationsResolver.{ts,js}',
  )
  const customResolvers = join(
    cwd,
    isDev
      ? config.resolvers.custom
      : config.resolvers.custom.replace(`${src}/`, `${dist}/`),
    '**/*Resolver.{ts,js}',
  )

  console.log({ customResolvers })

  return buildSchema({
    resolvers: [crudFilePath, relationFilePath, customResolvers],
    emitSchemaFile: config.emitSchemaFile,
    validate: config.validate,
  })
}
