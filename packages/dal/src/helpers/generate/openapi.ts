import type { mrapi } from '../../types'

import { Generator as OASGenerate } from '@mrapi/oas'

export default async function generateOpenapi({ nexusParams, paths }: any) {
  const oasParams: mrapi.generate.Options = {
    ...nexusParams,
    output: paths.outputOpenapi,
  }
  const openAPIGenerate = new OASGenerate(oasParams)
  await openAPIGenerate.run()
}
