import {
  enumType,
  inputObjectType,
  objectType,
  plugin,
  scalarType,
} from '@nexus/schema'
import { NexusAcceptedTypeDef } from '@nexus/schema/dist/builder'
import {
  DateTimeResolver,
  // JSONResolver
} from 'graphql-scalars'

import { getPrismaDmmf } from '@mrapi/common'

function parseObject(ast: any, variables: any): any {
  const value = Object.create(null)
  ast.fields.forEach((field: any) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(field.value, variables)
  })

  return value
}

function parseLiteral(ast: any, variables: any): any {
  switch (ast.kind) {
    case 'StringValue':
    case 'BooleanValue':
      return ast.value
    case 'IntValue':
    case 'FloatValue':
      return parseFloat(ast.value)
    case 'ObjectValue':
      return parseObject(ast, variables)
    case 'ListValue':
      return ast.values.map((n: any) => parseLiteral(n, variables))
    case 'NullValue':
      return null
    case 'Variable': {
      const name = ast.name.value
      return variables ? variables[name] : undefined
    }
  }
}

export const paljsPlugin = ({ prismaClient }: { prismaClient: string }) =>
  plugin({
    name: 'mrapi-paljs',
    description:
      'This plugin to add Prisma select to your resolver and prisma admin queries and mutations and all models input types',
    onInstall() {
      const dmmf = getPrismaDmmf(prismaClient)

      const JsonResolver = scalarType({
        name: 'Json',
        asNexusMethod: 'Json',
        description: 'Json custom scalar type',
        parseValue(value) {
          return value
        },
        serialize(value) {
          return value
        },
        parseLiteral,
      })

      const nexusSchemaInputs: NexusAcceptedTypeDef[] = [
        objectType({
          name: 'BatchPayload',
          definition(t) {
            t.int('count', { nullable: false })
          },
        }),
        DateTimeResolver,
        // JSONResolver,
        JsonResolver,
      ]

      dmmf.datamodel.models.forEach((input: any) => {
        nexusSchemaInputs.push(
          inputObjectType({
            name: `FindMany${input.name}Args`,
            definition(t) {
              t.int('skip', {
                nullable: true,
              })
              t.int('take', {
                nullable: true,
              })
              t.field('where', {
                type: `${input.name}WhereInput`,
                nullable: true,
              })
              t.field('orderBy', {
                type: `${input.name}OrderByInput`,
                nullable: true,
                list: true,
              })
              t.field('cursor', {
                type: `${input.name}WhereUniqueInput`,
                nullable: true,
              })
            },
          }),
        )

        nexusSchemaInputs.push(
          inputObjectType({
            name: `${input.name}Select`,
            definition(t) {
              input.fields.forEach((field: any) => {
                if (field.kind === 'scalar') {
                  t.boolean(field.name, { nullable: true })
                } else if (field.kind === 'object') {
                  t.field(field.name, {
                    type: `FindMany${field.name}Args`,
                    nullable: true,
                  })
                }
              })
            },
          }),
        )

        let hasObject = false
        for (const field of input.fields) {
          if (field.kind === 'object') {
            hasObject = true
            break
          }
        }
        if (hasObject) {
          nexusSchemaInputs.push(
            inputObjectType({
              name: `${input.name}Include`,
              definition(t) {
                input.fields.forEach((field: any) => {
                  if (field.kind === 'object') {
                    t.field(field.name, {
                      type: `FindMany${field.name}Args`,
                      nullable: true,
                    })
                  }
                })
              },
            }),
          )
        }
      })

      dmmf.schema.enums.forEach((item: any) => {
        nexusSchemaInputs.push(
          enumType({
            name: item.name,
            members: item.values,
          }),
        )
      })

      dmmf.schema.inputTypes.forEach((input: any) => {
        nexusSchemaInputs.push(
          inputObjectType({
            name: input.name,
            definition(t) {
              input.fields.forEach((field: any) => {
                const index: number =
                  field.inputTypes.length > 1 &&
                  field.inputTypes[1].kind === 'object'
                    ? 1
                    : 0
                const inputType = field.inputTypes[index]
                const fieldConfig: { [key: string]: any; type: string } = {
                  type: inputType.type as string,
                }
                if (inputType.isRequired) fieldConfig.nullable = false
                if (inputType.isList) fieldConfig.list = true
                t.field(field.name, fieldConfig)
              })
            },
          }),
        )
      })

      dmmf.schema.outputTypes
        .filter((type: any) => type.name.includes('Aggregate'))
        .forEach((type: any) => {
          nexusSchemaInputs.push(
            objectType({
              name: type.name,
              definition(t) {
                type.fields.forEach((field: any) => {
                  const fieldConfig: { [key: string]: any; type: string } = {
                    type: field.outputType.type as string,
                  }
                  if (field.outputType.isRequired) fieldConfig.nullable = false
                  if (field.outputType.isList) fieldConfig.list = [true]
                  t.field(field.name, fieldConfig)
                })
              },
            }),
          )
        })

      return { types: nexusSchemaInputs }
    },
  })
