import chalk from 'chalk'
import { join } from 'path'

import { Generators, writeFileSync, formation } from '@mrapi/common'
import { modelTmpFn, modelsTmpFn, getCrud } from './templates'

interface IObjType {
  type: string
  properties: {
    [name: string]: {
      description: string
      type?: string
      schema?: any
      $ref?: any
    }
  }
  required: string[]
}

// Reference URL: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat
function getFieldType(type: string) {
  switch (type) {
    case 'Int':
      return 'integer'
    case 'String':
      return 'string'
    case 'Boolean':
      return 'boolean'
    case 'DateTime':
      return 'string'
    case 'Float':
      return 'number'
  }
  throw new Error('Unknown field type.')
}

function findInputType(inputTypes: any[], modelName: string) {
  for (const inputType of inputTypes) {
    if (inputType.name === `${modelName}CreateInput`) {
      return inputType
    }
  }
}

function dealModels(models: any[]) {
  const obj = {}
  Array.isArray(models) &&
    models.forEach((model) => {
      obj[model.name] = model

      for (const field of model.fields) {
        if (field.isId) {
          obj[model.name].primaryField = field
          break
        }
      }
    })
  return obj
}

export class OasGenerator extends Generators {
  private outputFile(content: string, outputPath: string) {
    writeFileSync(outputPath, formation(content))
  }

  /**
   * generate definitions.js
   */
  private async genDefinitions() {
    const {
      datamodel,
      mappings,
      schema: { inputTypes },
    } = await this.dmmf()
    // Get the filtered models
    const models = await this.models()

    const allModelsObj = dealModels(datamodel.models)

    const modelDefinitions = {
      Error: {
        type: 'object',
        properties: {
          code: {
            description: 'Error code.',
            type: 'integer',
          },
          message: {
            description: 'Error message.',
            type: 'string',
          },
        },
      },
    }

    models.forEach((model: any) => {
      const obj: IObjType = {
        type: 'object',
        properties: {},
        required: [],
      }
      const inputObj: IObjType = {
        type: 'object',
        properties: {},
        required: [],
      }

      // inputTypes
      const inputType = findInputType(inputTypes, model.name) || {}
      inputType?.fields.forEach((field: any) => {
        const fieldInputType = Array.isArray(field.inputType)
          ? field.inputType[0]
          : field.inputType
        if (fieldInputType.kind === 'scalar') {
          const type = getFieldType(fieldInputType?.type)
          inputObj.properties[field.name] = {
            description: field.name,
            type,
          }
          fieldInputType?.isRequired && inputObj.required.push(field.name)
        }
        // else if (fieldInputType.kind === 'object') {
        //   inputObj.properties[field.name] = {
        //     type: 'object',
        //     description: field.name,
        //     $ref: `#/definitions/${field.name}`,
        //   }
        //   fieldInputType?.isRequired && inputObj.required.push(field.name)
        // }
      })

      // outputTypes
      model.fields.forEach((field: any) => {
        if (!this.excludeFields(model.name).includes(field.name)) {
          if (field.outputType.kind === 'scalar') {
            const type = getFieldType(field.outputType?.type)
            obj.properties[field.name] = {
              description: field.name,
              type,
            }
            field.outputType?.isRequired && obj.required.push(field.name)
          }
          // else if (field.outputType.kind === 'object') {
          //   obj.properties[field.name] = {
          //     type: 'object',
          //     description: field.name,
          //     $ref: `#/definitions/${field.name}`,
          //   }
          //   field.outputType?.isRequired && obj.required.push(field.name)
          // }
        }
      })

      modelDefinitions[model.name] = obj
      modelDefinitions[`${model.name}CreateInput`] = inputObj

      const mapping = mappings.find((m: any) => m.model === model.name)
      this.genPaths(model, mapping, allModelsObj[model.name])
    })

    this.outputFile(
      `exports.default = ${JSON.stringify(modelDefinitions)}`,
      join(this.options.output, 'definitions.js'),
    )
  }

  /**
   * generate oas paths files
   */
  private genPaths(model: any, mapping: any, modelObj: any) {
    const modelName = this.smallModel(model.name)

    const exclude = this.excludedOperations(model.name)
    const ableQueries = this.disableQueries(model.name)
    const ableMutations = this.disableMutations(model.name)

    // paths -> users
    this.outputFile(
      getCrud(
        modelsTmpFn,
        {
          GET: ableQueries && !exclude.includes('findMany'),
          POST: ableMutations && !exclude.includes('createOne'),
          DELETE: ableMutations && !exclude.includes('deleteMany'),
        },
        { modelName, plural: mapping.plural, name: model.name },
      ),
      join(this.options.output, `paths/${mapping.plural}.js`),
    )

    // paths -> users/{id}
    const pathId = {
      name: modelObj.primaryField.name,
      type: getFieldType(modelObj.primaryField.type),
    }
    this.outputFile(
      getCrud(
        modelTmpFn,
        {
          GET: ableQueries && !exclude.includes('findOne'),
          PUT: ableMutations && !exclude.includes('updateOne'),
          DELETE: ableMutations && !exclude.includes('deleteOne'),
        },
        { modelName, plural: mapping.plural, name: model.name },
        `{
  name: '${pathId.name}',
  in: 'path',
  type: '${pathId.type}',
  required: true,
  description: '${pathId.name}',
},`,
      ),
      join(this.options.output, `paths/${mapping.plural}/{${pathId.name}}.js`),
    )
  }

  async run() {
    await this.genDefinitions()

    console.log(chalk.green('\n✅  GenerateOAS run successful.\n'))
  }
}
