import chalk from 'chalk'
import { join } from 'path'
import fs from 'fs-extra'

import { Generators } from '@mrapi/common'
import { modelTmpFn, modelsTmpFn, getCrud } from './templates'

export class OasGenerator extends Generators {
  private outputFile(content: string, outputPath: string) {
    fs.outputFileSync(outputPath, this.formation(content))
  }

  /**
   * generate definitions.js
   */
  private async genDefinitions() {
    const { mappings } = await this.dmmf()
    const models = await this.models()

    const modelDefinitions = {
      Error: {
        additionalProperties: true,
      },
    }

    models.forEach((model: any) => {
      const obj: {
        type: string
        properties: {
          [name: string]: {
            description: string
            type?: string
            schema?: any
          }
        }
        required: string[]
      } = {
        type: 'object',
        properties: {},
        required: [],
      }

      model.fields.forEach((field: any) => {
        if (!this.excludeFields(model.name).includes(field.name)) {
          if (field.outputType.kind === 'scalar') {
            let type: string
            switch (field.outputType?.type) {
              case 'Int':
                type = 'integer'
                break
              case 'String':
                type = 'string'
                break
              case 'Boolean':
                type = 'boolean'
                break
            }

            if (type) {
              obj.properties[field.name] = {
                description: field.name,
                type,
              }
              field.outputType?.isRequired && obj.required.push(field.name)
            }
          }
          // else if (field.outputType.kind === 'object') {
          //   obj.properties[field.name] = {
          //     description: field.name,
          //     schema: {
          //       $ref: `#/definitions/${field.name}`,
          //     },
          //   }
          //   field.outputType?.isRequired && obj.required.push(field.name)
          // }
        }
      })

      modelDefinitions[model.name] = obj

      const mapping = mappings.find((m: any) => m.model === model.name)
      this.genPaths(model, mapping)
    })

    this.outputFile(
      `exports.default = ${JSON.stringify(modelDefinitions)}`,
      join(this.options.output, 'definitions.js'),
    )
  }

  /**
   * generate oas paths files
   */
  private genPaths(model: any, mapping: any) {
    const modelName = `${model.name.charAt(0).toLowerCase()}${model.name.slice(
      1,
    )}`

    // paths -> users
    this.outputFile(
      getCrud(
        modelsTmpFn,
        { GET: true, POST: true, DELETE: true },
        { modelName, plural: mapping.plural, name: model.name },
      ),
      join(this.options.output, `paths/${mapping.plural}.js`),
    )

    // paths -> users/{id}
    this.outputFile(
      getCrud(
        modelTmpFn,
        { GET: true, PUT: true, DELETE: true },
        { modelName, plural: mapping.plural, name: model.name },
      ),
      join(this.options.output, `paths/${mapping.plural}/{id}.js`),
    )
  }

  async run() {
    await this.genDefinitions()

    console.log(chalk.green('\n✅  GenerateOAS run successful.\n'))
  }
}
