import type { mrapi } from '../../types'

import { resolve } from 'path'
import { fs, resolveConfig, validateConfig, merge } from '@mrapi/common'

import DAL from '../..'
import generateSchema from './schema'
import generatePrisma from './prisma'
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

  let isManagement = name === 'management'
  let paths
  if (isManagement) {
    paths = dalOptions.management
  } else {
    // validate service name
    const service = dalOptions.services.find(
      (service: mrapi.dal.ServiceOptions) => service.name === name,
    )
    if (!service) {
      throw new Error(`Service "${name}" is not configured in "dal".`)
    }
    paths = service.paths
  }

  // clean
  if (paths.output) {
    await fs.emptyDir(paths.output)
  }

  await generateSchema({
    paths,
    provider,
  })

  await generatePrisma({
    paths,
  })

  if (isManagement) {
    return
  }

  // generate APIs
  const { nexusParams } = await generateGraphql({
    paths,
    options,
    generateOptions: merge(defaultGenerateOptions || {}, generate || {}),
  })

  await generateOpenapi({ paths, nexusParams })
}
