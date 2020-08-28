import { GenerateNexus } from './nexus'

import type { Options } from './types'

export class Generator {
  generator = new GenerateNexus({ ...this.options, nexusSchema: true })

  constructor(private readonly options?: Partial<Options>) {}

  async run() {
    await this.generator.run()
  }
}
