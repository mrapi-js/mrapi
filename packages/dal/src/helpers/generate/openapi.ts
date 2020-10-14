import type { mrapi } from '../../types'

import { Generator as OASGenerate } from '@mrapi/oas'

export default async function generateOpenapi({
  nexusParams,
  paths,
  logger,
}: any) {
  const oasParams: mrapi.generate.Options = {
    ...nexusParams,
    output: paths.outputOpenapi,
  }
  const openAPIGenerate = new OASGenerate(oasParams, logger)
  await openAPIGenerate.run()
}
