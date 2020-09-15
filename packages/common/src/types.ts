export enum DBProvider {
  postgresql = 'postgresql',
  mysql = 'mysql',
  sqlite = 'sqlite',
}

export type Query = 'findOne' | 'findMany' | 'findCount' | 'aggregate'
export type Mutation =
  | 'createOne'
  | 'updateOne'
  | 'upsertOne'
  | 'deleteOne'
  | 'updateMany'
  | 'deleteMany'

export type QueriesAndMutations = Query | Mutation

export interface GeneratorOptions {
  models?: string[]
  schema: string
  output: string
  excludeFields: string[]
  excludeModels: Array<{ name: string; queries?: boolean; mutations?: boolean }>
  disableQueries?: boolean
  disableMutations?: boolean
  excludeFieldsByModel: { [modelName: string]: string[] }
  onDelete?: boolean
  nexusSchema?: boolean
  excludeQueriesAndMutationsByModel: {
    [modelName: string]: QueriesAndMutations[]
  }
  excludeQueriesAndMutations: QueriesAndMutations[]
}
