import type { mrapi } from './types'

import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

import { formation } from './shell'

// const tscOptions = [
//   '-t es2018',
//   '--lib esnext',
//   '--module commonjs',
//   '--moduleResolution node',
//   '--allowSyntheticDefaultImports',
//   '--esModuleInterop',
//   '--importHelpers',
//   '--resolveJsonModule',
//   '--sourceMap false ',
//   '--declaration',
//   '--skipLibCheck',
// ].join(' ')

export class Generators {
  protected options: mrapi.generate.Options = {
    schema: '',
    output: '',
    excludeFields: [],
    excludeModels: [],
    excludeFieldsByModel: {},
    excludeQueriesAndMutations: [],
    excludeQueriesAndMutationsByModel: {},
  }
  protected isJS?: boolean = false
  protected queries: mrapi.generate.Query[] = [
    'findOne',
    'findMany',
    'findCount',
    'aggregate',
  ]
  protected mutations: mrapi.generate.Mutation[] = [
    'createOne',
    'updateOne',
    'upsertOne',
    'deleteOne',
    'updateMany',
    'deleteMany',
  ]

  constructor(customOptions?: Partial<mrapi.generate.Options>) {
    this.options = { ...this.options, ...customOptions }
    this.isJS = this.options.javascript
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

  protected withExtension(filename: string) {
    return filename + (this.isJS ? '.js' : '.ts')
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

  protected getIndexContent(files: string[]) {
    const lines: string[] = []
    if (this.isJS) lines.push('module.exports = {')
    files.forEach((file) => {
      if (this.isJS) {
        lines.push(`  ...require('./${file}'),`)
      } else {
        lines.push(`export * from './${file}'`)
      }
    })
    if (this.isJS) lines.push('}')
    return lines.join('\n')
  }

  protected getImport(content: string, path: string) {
    return this.isJS
      ? `const ${content} = require('${path}')`
      : `import ${content} from '${path}'`
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

  protected get parser() {
    return this.isJS ? 'babel' : 'babel-ts'
  }

  // protected formation = formation
  protected formation(text: string) {
    return formation(text, this.parser)
  }

  // async toJS() {
  //   const { output } = this.options

  //   // Glob is blocked in windows. That is `npx tsc **/*.ts` cannot execute in windows. It maybe a problem of npx.
  //   // The script underline cannot execute successfully in windows.
  //   // const exitPalCode = await spawnShell(
  //   //   `npx tsc ${tscOptions} ${output}/*.ts ${output}/**/*.ts ${output}/**/**/*.ts`,
  //   // )

  //   const files: string[] = [
  //     ...glob.sync(`${output}/*.ts`),
  //     ...glob.sync(`${output}/**/*.ts`),
  //     ...glob.sync(`${output}/**/**/*.ts`),
  //   ]
  //   const exitPalCode = await spawnShell(
  //     `npx tsc ${tscOptions} ${files.join(' ')}`,
  //   )
  //   if (exitPalCode !== 0) {
  //     throw new Error('Generate nexus types exception.')
  //   }
  // }
}
