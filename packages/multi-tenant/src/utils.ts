import {
  MrapiError,
  Datasource,
  runShell,
  getPrismaCliPath,
} from '@mrapi/common'

// Run from the place where the CLI was called
export const runDistant = async (
  cmd: string,
  tenant?: Datasource,
): Promise<string | Buffer> => {
  return await runShell(cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: tenant?.url || process.env.DATABASE_URL || 'PMT_TMP_URL',
    },
  })
}
export const translateDatasourceUrl = (url: string): string => {
  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    return 'file:' + process.cwd() + '/prisma/' + url.replace('file:', '')
  }

  return url
}

export const getManagementEnv = async (): Promise<{
  [name: string]: string
}> => {
  if (!process.env.MANAGEMENT_URL) {
    throw new MrapiError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  return {
    PMT_MANAGEMENT_URL: translateDatasourceUrl(process.env.MANAGEMENT_URL),
    PMT_OUTPUT: 'PMT_TMP',
  }
}

export const setManagementEnv = async () => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(
    ([key, value]) => (process.env[key] = value),
  )
}

export const runDistantPrisma = async (
  cmd: string,
  tenant?: Datasource,
  withTimeout = true,
): Promise<string | Buffer> => {
  const promise = runDistant(`"${getPrismaCliPath()}" ${cmd}`, tenant)

  if (!withTimeout) {
    return await promise
  }

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const altCmd =
        (tenant?.name ? `prisma-multi-tenant env ${tenant.name} -- ` : '') +
        'npx @prisma/cli ' +
        cmd
      console.log(
        `\n  {yellow Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}\n`,
      )
    }, 30 * 1000)

    promise
      .then(() => {
        clearTimeout(timeout)
        resolve()
      })
      .catch(reject)
  })
}
