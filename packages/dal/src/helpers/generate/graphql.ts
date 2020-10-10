import type { mrapi } from '../../types'

import { join } from 'path'
import { Generator as NexusGenerate } from '@mrapi/nexus'
import { merge } from '@mrapi/common'

const cntWhiteList = ['disableQueries', 'disableMutations']
const cntWhiteListSet = new Set(cntWhiteList)

export default async function generateGraphql({
  outputDir,
  options,
  generateOptions,
}: {
  outputDir: string
  options: {
    cnt?: string
    m?: string
    em?: string
    eqm?: string
  }
  generateOptions?: mrapi.generate.Options
}) {
  const nexusParams: mrapi.generate.Options = merge(generateOptions, {
    schema: outputDir,
    output: join(outputDir, 'nexus-types'),
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

  const nexusGenerate = new NexusGenerate(nexusParams)
  await nexusGenerate.run()

  return { nexusParams }
}
