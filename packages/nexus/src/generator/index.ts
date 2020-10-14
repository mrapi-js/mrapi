import type { mrapi } from '@mrapi/common'

import { getLogger } from '@mrapi/common'

import { GenerateNexus } from './nexus'

export class Generator {
  generator = new GenerateNexus({ ...this.options, nexusSchema: true })

  constructor(
    private readonly options?: Partial<mrapi.generate.Options>,
    protected logger?: mrapi.Logger,
  ) {
    this.logger = getLogger(logger, {
      name: 'mrapi-nexus',
    })
  }

  async run() {
    await this.generator.run()
  }
}
