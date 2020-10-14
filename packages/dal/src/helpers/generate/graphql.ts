import type { mrapi } from '../../types'

import { Generator as NexusGenerate } from '@mrapi/nexus'
import { merge } from '@mrapi/common'

const cntWhiteList = ['disableQueries', 'disableMutations']
const cntWhiteListSet = new Set(cntWhiteList)

export default async function generateGraphql({
  paths,
  options,
  generateOptions,
  logger,
}: {
  paths: mrapi.dal.ServicePaths
  options: {
    cnt?: string
    m?: string
    em?: string
    eqm?: string
  }
  generateOptions?: mrapi.generate.Options
  logger?: mrapi.Logger
}) {
  const nexusParams: mrapi.generate.Options = merge(generateOptions || {}, {
    schema: paths.outputPrismaClient,
    output: paths.outputGraphql,
  } as Partial<mrapi.generate.Options>)

  if (options.cnt) {
    options.cnt.split(',').forEach((item: string) => {
      if (cntWhiteListSet.has(item)) {
        nexusParams[item] = true
      }
    })
  }

  if (options.m) {
    nexusParams.models = options.m.split(',')
  }

  if (options.em) {
    options.em.split(',').forEach((item: string) => {
      nexusParams.excludeModels.push({
        name: item,
        queries: true,
        mutations: true,
      })
    })
  }

  if (options.eqm) {
    nexusParams.excludeQueriesAndMutations = options.eqm.split(
      ',',
    ) as mrapi.generate.QueriesAndMutations[]
  }

  const nexusGenerate = new NexusGenerate(nexusParams, logger)
  await nexusGenerate.run()

  return { nexusParams }
}
