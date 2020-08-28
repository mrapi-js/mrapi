// import { PrismaSelect } from '@paljs/plugins'
import { enumType, inputObjectType, objectType, plugin } from '@nexus/schema'
import { NexusAcceptedTypeDef } from '@nexus/schema/dist/builder'
import { getPrismaDmmf } from './getPrisma'

export const paljs = ({ prismaClient }: { prismaClient: string }) =>
  plugin({
    name: 'paljs',
    description:
      'paljs plugin to add Prisma select to your resolver and prisma admin queries and mutations and all models input types',
    onInstall() {
      const data = getPrismaDmmf(prismaClient).schema

      const nexusSchemaInputs: NexusAcceptedTypeDef[] = [
        objectType({
          name: 'BatchPayload',
          definition(t) {
            t.int('count', { nullable: false })
          },
        }),
      ]

      data.enums.forEach((item: any) => {
        nexusSchemaInputs.push(
          enumType({
            name: item.name,
            members: item.values,
          }),
        )
      })
      data.inputTypes.forEach((input: any) => {
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

      data.outputTypes
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
    onCreateFieldResolver() {
      return async (root, args, ctx, info: any, next) => {
        // ctx.select = new PrismaSelect(info).value
        const r = await next(root, args, ctx, info)
        return r
      }
    },
  })
