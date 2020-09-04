import { existsSync } from 'fs'
import { join } from 'path'

import { Generators, writeFileSync, readFileSync } from '@mrapi/common'
import { getCrud } from './templates'

export class GenerateNexus extends Generators {
  private readonly indexPath = this.output('index.ts')
  private index = this.readIndex()
  private readonly includeModel = {}

  async run() {
    const datamodel = await this.datamodel()
    for (const model of datamodel.models) {
      for (const field of model.fields) {
        if (field.kind === 'object') {
          this.includeModel[model.name] = true
          continue
        }
      }
    }

    await this.createModels()
    this.createIndex()
  }

  private async createModels() {
    const models = await this.models()
    models.forEach((model: any) => {
      const exportString = `export * from './${model.name}'`
      if (!this.index.includes(exportString)) {
        this.index = `export * from './${model.name}'\n${this.index}`
      }

      let fileContent = `${
        this.options.nexusSchema
          ? 'import { objectType } from "@nexus/schema"'
          : 'import { schema } from "nexus"'
      }\n\n`

      fileContent += `${
        this.options.nexusSchema ? `export const ${model.name} = ` : 'schema.'
      }objectType({
  name: '${model.name}',
  definition(t) {
    `
      model.fields.forEach((field: any) => {
        if (!this.excludeFields(model.name).includes(field.name)) {
          const options = this.getOptions(field)
          if (
            field.outputType.kind === 'scalar' &&
            field.outputType.type !== 'DateTime'
          ) {
            fileContent += `t.${(field.outputType
              .type as String).toLowerCase()}('${field.name}'${options})\n`
          } else {
            fileContent += `t.field('${field.name}'${options})\n`
          }
        }
      })

      fileContent += '},\n})\n\n'
      const path = this.output(model.name)
      this.mkdir(path)
      writeFileSync(
        join(path, 'type.ts'),
        this.formation(fileContent, 'babel-ts'),
      )

      let modelIndex = 'export * from "./type"\n'
      modelIndex += this.createQueriesAndMutations(model.name)
      this.createIndex(path, modelIndex)
    })
  }

  private createQueriesAndMutations(name: string) {
    const exclude = this.excludedOperations(name)
    let modelIndex = ''
    if (this.disableQueries(name)) {
      let queriesIndex = ''
      const path = this.output(name, 'queries')
      this.queries
        .filter((item) => !exclude.includes(item))
        .map((item) => {
          const itemContent = getCrud(
            name,
            'query',
            item,
            this.options.onDelete,
            this.options.nexusSchema,
            !!this.includeModel[name],
          )
          this.createFileIfNotfound(
            path,
            `${item}.ts`,
            this.formation(itemContent, 'babel-ts'),
          )
          queriesIndex += `export * from './${item}'
`
        })
      if (queriesIndex && this.options.nexusSchema) {
        modelIndex += `export * from './queries'
`
        writeFileSync(
          join(path, 'index.ts'),
          this.formation(queriesIndex, 'babel-ts'),
        )
      }
    }

    if (this.disableMutations(name)) {
      let mutationsIndex = ''
      const path = this.output(name, 'mutations')
      this.mutations
        .filter((item) => !exclude.includes(item))
        .map((item) => {
          const itemContent = getCrud(
            name,
            'mutation',
            item,
            this.options.onDelete,
            this.options.nexusSchema,
            !!this.includeModel[name],
          )
          this.createFileIfNotfound(
            path,
            `${item}.ts`,
            this.formation(itemContent, 'babel-ts'),
          )
          mutationsIndex += `export * from './${item}'
`
        })
      if (mutationsIndex && this.options.nexusSchema) {
        modelIndex += 'export * from "./mutations"'
        writeFileSync(
          join(path, 'index.ts'),
          this.formation(mutationsIndex, 'babel-ts'),
        )
      }
    }
    return modelIndex
  }

  private createIndex(path?: string, content?: string) {
    if (this.options.nexusSchema) {
      if (path && content) {
        writeFileSync(
          join(path, 'index.ts'),
          this.formation(content, 'babel-ts'),
        )
      } else {
        writeFileSync(
          this.output('index.ts'),
          this.formation(this.index, 'babel-ts'),
        )
      }
    }
  }

  private readIndex() {
    return existsSync(this.indexPath) ? readFileSync(this.indexPath) : ''
  }

  private getOptions(field: any) {
    const options: any = field.outputType.isList
      ? { nullable: false, list: [true] }
      : { nullable: !field.outputType.isRequired }
    if (
      field.outputType.kind !== 'scalar' ||
      field.outputType.type === 'DateTime'
    ) {
      options.type = field.outputType.type
    }
    if (field.args.length > 0) {
      field.args.forEach((arg: any) => {
        if (!options.args) options.args = {}
        options.args[arg.name] = arg.inputType[0].type
      })
    }
    let toString = JSON.stringify(options)
    if (field.outputType.kind === 'object') {
      toString = toString.slice(0, -1)
      toString += `, resolve(parent: any) {
      return parent['${field.name}']
    },
    }`
    }
    return ', ' + toString
  }
}
