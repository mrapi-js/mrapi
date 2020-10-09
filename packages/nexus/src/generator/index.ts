import type { mrapi } from '@mrapi/common'

import chalk from 'chalk'

import { GenerateNexus } from './nexus'

export class Generator {
  generator = new GenerateNexus({ ...this.options, nexusSchema: true })

  constructor(private readonly options?: Partial<mrapi.generate.Options>) {}

  async run() {
    await this.generator.run()

    console.log(chalk.green('\n✅  GenerateNexus run successful.\n'))
  }

  async toJS() {
    // await this.generator.toJS()
    // console.log(chalk.green('\n✅  GenerateNexus toJS successful.\n'))
  }
}
