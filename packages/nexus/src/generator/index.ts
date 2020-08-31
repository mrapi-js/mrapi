import { spawnShell } from '@mrapi/common'
import { GenerateNexus } from './nexus'

import type { Options } from './types'

const tscOptions = [
  '-t es2018',
  '--lib esnext',
  '--module commonjs',
  '--moduleResolution node',
  '--allowSyntheticDefaultImports',
  '--esModuleInterop',
  '--importHelpers',
  '--resolveJsonModule',
  '--sourceMap false ',
  '--declaration',
  '--skipLibCheck',
].join(' ')

export class Generator {
  generator = new GenerateNexus({ ...this.options, nexusSchema: true })

  constructor(private readonly options?: Partial<Options>) {}

  async run() {
    await this.generator.run()
  }

  async toJS() {
    const { output } = this.options
    const exitPalCode = await spawnShell(
      `npx tsc ${tscOptions} ${output}/*.ts ${output}/**/*.ts ${output}/**/**/*.ts`,
    )
    if (exitPalCode !== 0) {
      throw new Error('Generate nexus types exception.')
    }
  }
}
