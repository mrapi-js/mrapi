import { enumType, inputObjectType, objectType, plugin } from '@nexus/schema'
import { NexusAcceptedTypeDef } from '@nexus/schema/dist/builder'

import { getPrismaDmmf } from '@mrapi/common'

export const paljsPlugin = ({ prismaClient }: { prismaClient: string }) =>
  plugin({
    name: 'mrapi-paljs',
    description:
      'This plugin to add Prisma select to your resolver and prisma admin queries and mutations and all models input types',
    onInstall() {
      const dmmf = getPrismaDmmf(prismaClient)

      const nexusSchemaInputs: NexusAcceptedTypeDef[] = [
        objectType({
          name: 'BatchPayload',
          definition(t) {
            t.int('count', { nullable: false })
          },
        }),
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
                let inputType: any
                if (
                  field.inputType.length > 1 &&
                  field.inputType[1].type !== 'null' &&
                  field.name !== 'not'
                ) {
                  inputType = field.inputType[1]
                } else {
                  inputType = field.inputType[0]
                }
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
                  if (field.outputType.isList) fieldConfig.list = true
                  t.field(field.name, fieldConfig)
                })
              },
            }),
          )
        })

      return { types: nexusSchemaInputs }
    },
  })
