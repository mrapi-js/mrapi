import chalk from 'chalk'
import { join } from 'path'

import type { Options } from '../types'

export class Generator {
  protected options: Options = {
    schema: join(process.cwd(), 'node_modules', '@prisma/client'),
    output: join(process.cwd(), '.mrapi'),
    excludeFields: [],
    excludeModels: [],
    excludeFieldsByModel: {},
    excludeQueriesAndMutations: [],
    excludeQueriesAndMutationsByModel: {},
  }

  constructor(customOptions?: Options) {
    this.options = { ...this.options, ...customOptions }
  }

  async run() {
    // await this.generator.run()

    console.log(chalk.green('\n✅  GenerateOAS run successful.\n'))
  }
}
