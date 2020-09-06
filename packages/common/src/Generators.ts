import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { spawnShell, formation } from './shell'
import type { Mutation, GeneratorOptions as Options, Query } from './types'

const tscOptions = [
  '-t es2018',
  '--lib esnext',
  '--module commonjs',
  '--moduleResolution node',
  '--allowSyntheticDefaultImports',
  '--esModuleInterop',
  '--importHelpers',
  '--resolveJsonModule',
  '--sourceMap false ',
  '--declaration',
  '--skipLibCheck',
].join(' ')

export class Generators {
  protected options: Options = {
    schema: '',
    output: '',
    excludeFields: [],
    excludeModels: [],
    excludeFieldsByModel: {},
    excludeQueriesAndMutations: [],
    excludeQueriesAndMutationsByModel: {},
  }

  protected queries: Query[] = ['findOne', 'findMany', 'findCount', 'aggregate']
  protected mutations: Mutation[] = [
    'createOne',
    'updateOne',
    'upsertOne',
    'deleteOne',
    'updateMany',
    'deleteMany',
  ]

  constructor(customOptions?: Partial<Options>) {
    this.options = { ...this.options, ...customOptions }
  }

  protected async dmmf() {
    const { dmmf } = await import(this.options.schema)
    return dmmf
  }

  protected async datamodel() {
    const { datamodel }: { datamodel: any } = await this.dmmf()
    return datamodel
  }

  protected async models() {
    const { schema }: { schema: any } = await this.dmmf()
    // Plan to replace "outputTypes" to "datamodel.models"
    return schema.outputTypes.filter(
      (model: any) =>
        !['Query', 'Mutation'].includes(model.name) &&
        !model.name.includes('Aggregate') &&
        model.name !== 'BatchPayload' &&
        (!this.options.models || this.options.models.includes(model.name)),
    )
  }

  protected excludeFields(model: string) {
    return this.options.excludeFields.concat(
      this.options.excludeFieldsByModel[model],
    )
  }

  protected disableQueries(model: string) {
    return (
      !this.options.disableQueries &&
      !this.options.excludeModels.find(
        (item) => item.name === model && item.queries,
      )
    )
  }

  protected disableMutations(model: string) {
    return (
      !this.options.disableMutations &&
      !this.options.excludeModels.find(
        (item) => item.name === model && item.mutations,
      )
    )
  }

  protected smallModel(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1)
  }

  protected excludedOperations(model: string) {
    return this.options.excludeQueriesAndMutations.concat(
      this.options.excludeQueriesAndMutationsByModel[model] ?? [],
    )
  }

  protected mkdir(path: string) {
    !existsSync(path) && mkdirSync(path, { recursive: true })
  }

  protected output(...paths: string[]): string {
    return join(this.options.output, ...paths)
  }

  protected createFileIfNotfound(
    path: string,
    fileName: string,
    content: string,
  ) {
    !existsSync(path) && this.mkdir(path)
    !existsSync(join(path, fileName)) &&
      writeFileSync(join(path, fileName), content)
  }

  protected formation = formation

  async toJS() {
    const { output } = this.options
    const exitPalCode = await spawnShell(
      `npx tsc ${tscOptions} ${output}/*.ts ${output}/**/*.ts ${output}/**/**/*.ts`,
    )
    if (exitPalCode !== 0) {
      throw new Error('Generate nexus types exception.')
    }
  }
}
