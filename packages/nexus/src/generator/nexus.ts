import { join } from 'path'
import { fs, Generators } from '@mrapi/common'

import { getCrud } from './templates'

export class GenerateNexus extends Generators {
  private readonly includeModel = {}

  private indexPath = this.output(this.withExtension('index'))
  private indexTS = this.readIndex()
  private indexJS: string[] = []

  protected getImport(content: string, path: string) {
    return this.isJS
      ? `const ${content} = require('${path}')`
      : `import ${content} from '${path}'`
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
    await this.createIndex()
  }

  private async createModels() {
    const models = await this.models()
    models.forEach(async (model: any) => {
      if (this.isJS) {
        this.indexJS.push(model.name)
      } else {
        const exportString = `export * from './${model.name}'`
        if (!this.indexTS.includes(exportString)) {
          this.indexTS = `export * from './${model.name}'\n${this.indexTS}`
        }
      }

      let fileContent = `${this.getImport(
        '{ objectType }',
        '@nexus/schema',
      )}\n\n`

      fileContent += `${!this.isJS ? 'export ' : ''}const ${
        model.name
      } = objectType({
  name: '${model.name}',
  nonNullDefaults: {
    output: true
  },
  definition (t) {
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

      fileContent += `},\n})\n\n${
        this.isJS ? `module.exports = {${model.name}}` : ''
      }`
      const path = this.output(model.name)
      this.mkdir(path)
      await fs.writeFile(
        join(path, this.withExtension('type')),
        this.formation(fileContent),
      )

      await this.createIndex(
        path,
        ['type'].concat(await this.createQueriesAndMutations(model.name)),
      )
    })
  }

  private async createQueriesAndMutations(name: string) {
    const exclude = this.excludedOperations(name)
    let modelIndex: string[] = []
    if (this.disableQueries(name)) {
      const queriesIndex: string[] = []
      const path = this.output(name, 'queries')
      this.queries
        .filter((item) => !exclude.includes(item))
        .map((item) => {
          const itemContent = getCrud(
            name,
            'query',
            item,
            this.options.onDelete,
            this.isJS,
          )
          this.createFileIfNotfound(
            path,
            this.withExtension(item),
            this.formation(itemContent),
          )
          queriesIndex.push(item)
        })
      if (queriesIndex) {
        modelIndex.push('queries')
        await fs.writeFile(
          join(path, this.withExtension('index')),
          this.formation(this.getIndexContent(queriesIndex)),
        )
      }
    }

    if (this.disableMutations(name)) {
      const mutationsIndex: string[] = []
      const path = this.output(name, 'mutations')
      this.mutations
        .filter((item) => !exclude.includes(item))
        .map((item) => {
          const itemContent = getCrud(
            name,
            'mutation',
            item,
            this.options.onDelete,
            this.isJS,
          )
          this.createFileIfNotfound(
            path,
            this.withExtension(item),
            this.formation(itemContent),
          )
          mutationsIndex.push(item)
        })
      if (mutationsIndex) {
        modelIndex.push('mutations')
        await fs.writeFile(
          join(path, this.withExtension('index')),
          this.formation(this.getIndexContent(mutationsIndex)),
        )
      }
    }
    return modelIndex
  }

  private async createIndex(path?: string, content?: string[]) {
    if (path && content) {
      await fs.writeFile(
        join(path, this.withExtension('index')),
        this.formation(this.getIndexContent(content)),
      )
    } else {
      await fs.writeFile(
        this.output(this.withExtension('index')),
        this.formation(
          this.isJS ? this.getIndexContent(this.indexJS) : this.indexTS,
        ),
      )
    }
  }

  private readIndex() {
    return fs.pathExistsSync(this.indexPath)
      ? fs.readFileSync(this.indexPath, {
          encoding: 'utf8',
        })
      : ''
  }

  private getOptions(field: any) {
    const options: any = field.outputType.isList
      ? { nullable: false, list: [true] }
      : { nullable: !field.isRequired }
    if (
      field.outputType.kind !== 'scalar' ||
      field.outputType.type === 'DateTime'
    )
      options['type'] = field.outputType.type
    if (field.args.length > 0) {
      field.args.forEach((arg: any) => {
        if (!options['args']) options['args'] = {}
        options['args'][arg.name] = arg.inputTypes[0].type
      })
    }
    let toString = JSON.stringify(options)
    if (field.outputType.kind === 'object') {
      toString = toString.slice(0, -1)
      // https://github.com/graphql-nexus/schema/releases/tag/v0.16.0
      // list should be non-nullable
      // L195: { nullable: false, list: [true] }
      toString += `, resolve: parent${this.isJS ? '' : ': any'} => parent['${
        field.name
      }'] || ${field.outputType.isList ? '[]' : 'null'}
    },`
    }
    return ', ' + toString
  }
}
