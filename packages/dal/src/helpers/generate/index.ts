import type { mrapi } from '@mrapi/common'

import { resolve } from 'path'
import { resolveConfig, validateConfig, merge } from '@mrapi/common'

import DAL from '../..'
import generateManagement from './management'
import generateSchema from './schema'
import generateTenant from './tenant'
import generateGraphql from './graphql'
import generateOpenapi from './openapi'

const defaultGenerateOptions: Partial<mrapi.generate.Options> = {
  javascript: true,
}

export async function generate({
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

  if (generate) {
    const isValid = validateConfig(
      generate,
      resolve(__dirname, '../../../schemas/generate.json'),
      'generate',
    )

    if (!isValid) {
      process.exit()
    }
  }

  const dal = new DAL()
  const dalOptions = dal.options

  // generate management
  if (name === 'management') {
    if (!dalOptions.management.enable) {
      throw new Error('management not enabled')
    }
    await generateManagement(dalOptions.management)
    return
  }

  // validate service name
  const service = dalOptions.services.find((service) => service.name === name)
  if (!service) {
    throw new Error(`Service "${name}" is not configured in "dal".`)
  }

  const { outputDir, outputSchemaPath } = await generateSchema({
    ...service,
    provider,
  })

  await generateTenant({
    targetSchema: outputSchemaPath,
  })

  const { nexusParams } = await generateGraphql({
    outputDir,
    options,
    generateOptions: merge(defaultGenerateOptions, generate || {}),
  })

  await generateOpenapi({ outputDir, nexusParams })
}
