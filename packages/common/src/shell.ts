import fs from 'fs-extra'
import { format, Options as PrettierOptions } from 'prettier'
import { exec, spawn, SpawnOptions, ExecOptions } from 'child_process'

import { getLogger, Logger } from './logger'

export const runShell = async (
  cmd: string,
  options?: ExecOptions,
  logger?: Logger,
): Promise<string | Buffer> => {
  const log = getLogger(logger, { name: 'mrapi-cmd' })
  log.debug(
    `Running command "${cmd}" with options ${JSON.stringify(options || {})}`,
  )

  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        cwd: process.cwd(),
        ...(options || {}),
        env: {
          ...process.env,
          ...(options?.env || {}),
        },
      },
      (
        error: Error | null,
        stdout: string | Buffer,
        stderr: string | Buffer,
      ) => {
        if (process.env.verbose === 'true') {
          if (stderr) {
            log.error(stderr.toString())
          }
          if (stdout) {
            log.info(stdout.toString())
          }
        }
        if (error) reject(error)
        resolve(stdout)
      },
    )
  })
}

export const spawnShell = (
  cmd: string,
  options?: SpawnOptions,
  logger?: Logger,
): Promise<number> => {
  const log = getLogger(logger, { name: 'mrapi-cmd' })
  log.debug(
    `Running command "${cmd}" with options ${JSON.stringify(options || {})}`,
  )

  const [command, ...commandArguments] = cmd.split(' ')
  return new Promise((resolve) =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
      cwd: process.cwd(),
      ...options,
    }).on('exit', (exitCode: number) => resolve(exitCode)),
  )
}

export const runPrisma = async (cmd: string, options?: ExecOptions) => {
  const cmdStr =
    'npx prisma ' + (cmd.includes('migrate') ? cmd + ' --experimental' : cmd)

  return runShell(cmdStr, options)
}

export const useYarn = async (): Promise<boolean> => {
  return fs.pathExists(process.cwd() + '/yarn.lock')
}

export const formation = (
  text: string,
  parser: PrettierOptions['parser'] = 'babel-ts', //'babel',
  prefixStr: string = `/**
 * This file was generated by mrapi
 * Do not make changes to this file directly
 */`,
) => {
  return format(`${prefixStr}\n${text}`, {
    singleQuote: true,
    semi: false,
    trailingComma: 'all',
    tabWidth: 2,
    parser,
  })
}

export const readFileSync = (path: string) => {
  return fs.readFileSync(path, 'utf8')
}

export const writeFileSync = (path: string, content: string) => {
  return fs.outputFileSync(path, content)
}
