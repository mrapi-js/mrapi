import type { mrapi } from '../types'

import { join } from 'path'
import { Generator as OASGenerate } from '@mrapi/oas'

export default async function generateOpenapi({ outputDir, nexusParams }: any) {
  const oasOutput = join(outputDir, 'api')
  const oasParams: mrapi.generate.Options = {
    ...nexusParams,
    output: oasOutput,
  }
  const openAPIGenerate = new OASGenerate(oasParams)
  await openAPIGenerate.run()
}
