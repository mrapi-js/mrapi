import type { mrapi } from '@mrapi/common'
import { getUrlAndProvider, resolveConfig, merge } from '@mrapi/common'

import DAL from '../index'
import generateGraphql from './graphql'
import generateManagement from './management'
import generateMultiTanent from './multi-tanent'
import generateOpenapi from './openapi'
import generatePrismaSchema from './prisma-schema'

const defaultGenerateOptions: Partial<mrapi.generate.Options> = {
  javascript: true,
}

export default async function generate({
  name,
  provider,
  options,
}: {
  name: string
  provider: string
  options: {
    cnt?: string
    m?: string
    em?: string
    eqm?: string
  }
}) {
  const { generate } = resolveConfig()
  const generateOptions = merge(defaultGenerateOptions, generate || {})

  const dal = new DAL()
  const dalOptions = dal.options
  const managementUrl = dalOptions.management.dbUrl
  const managementObj = getUrlAndProvider(managementUrl)

  // generate management
  if (name === 'management' && dalOptions.management.enable) {
    await generateManagement(managementObj)

    return
  }

  const { outputDir, outputSchemaPath } = await generatePrismaSchema({
    name,
    paths: dalOptions.paths,
    provider,
  })

  await generateMultiTanent({
    managementObj,
    outputSchemaPath,
  })

  const { nexusParams } = await generateGraphql({
    outputDir,
    options,
    generateOptions,
  })

  await generateOpenapi({ outputDir, nexusParams })
}
