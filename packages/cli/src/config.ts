import type { mrapi } from '@mrapi/common'

import { resolveConfig, merge } from '@mrapi/common'

const defaultCliOptions: mrapi.cli.Options = {
  paths: {
    env: 'config/.env',
    input: 'config/prisma',
    output: 'node_modules/.mrapi',
  },
}

export function resolveOptions(options?: mrapi.cli.Options) {
  const { cli } = resolveConfig()
  return merge(
    {
      ...defaultCliOptions,
      ...(cli || {}),
    },
    options || {},
  ) as mrapi.cli.Options
}
