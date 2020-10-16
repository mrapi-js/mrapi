import type { mrapi } from '../../types'

import { dirname, resolve, relative } from 'path'
import {
  fs,
  resolveConfig,
  validateConfig,
  merge,
  getLogger,
} from '@mrapi/common'

import { DAL } from '../..'
import generateSchema from './schema'
import generatePrisma from './prisma'
import generateGraphql from './graphql'
import generateOpenapi from './openapi'

const logger = getLogger(null, {
  name: 'mrapi-generate',
})

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

  const logPrefix = `[${name}] `
  let isManagement = name === 'management'
  let paths
  if (isManagement) {
    paths = dalOptions.management
  } else if (dalOptions.services) {
    // validate service name
    const service = dalOptions.services?.find(
      (service: mrapi.dal.ServiceOptions) => service.name === name,
    )
    if (!service) {
      logger.error(`Service "${name}" is not configured in "dal".`)
      process.exit()
    }
    paths = service.paths
  } else {
    paths = dalOptions.paths
  }

  // clean
  if (paths.output) {
    await fs.emptyDir(paths.output)
  }

  await generateSchema({
    paths,
    provider,
    logger,
  })
  logger.info(
    `${logPrefix}prisma schema generate at: ${relative(
      process.cwd(),
      paths.outputSchema,
    )}`,
  )

  await generatePrisma({
    paths,
    logger,
  })
  logger.info(
    `${logPrefix}prisma client generate at: ${dirname(
      relative(process.cwd(), paths.outputSchema),
    )}`,
  )

  if (isManagement) {
    return
  }

  // generate APIs
  const { nexusParams } = await generateGraphql({
    paths,
    options,
    generateOptions: merge(defaultGenerateOptions || {}, generate || {}),
    logger,
  })
  logger.info(
    `${logPrefix}graphql generate at: ${relative(
      process.cwd(),
      paths.outputGraphql,
    )}`,
  )

  await generateOpenapi({ paths, nexusParams, logger })
  logger.info(
    `${logPrefix}openapi generate at: ${relative(
      process.cwd(),
      paths.outputOpenapi,
    )}`,
  )
}
