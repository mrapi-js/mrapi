import fs from 'fs'
import { join } from 'path'
import { exec, spawn, SpawnOptions, ExecOptions } from 'child_process'
import { pathExists, getNodeModules } from './utils'

export const runShell = (
  cmd: string,
  options?: ExecOptions,
): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('[CMD] ' + cmd)
  }

  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        cwd: process.cwd(),
        ...options,
      },
      (
        error: Error | null,
        stdout: string | Buffer,
        stderr: string | Buffer,
      ) => {
        if (process.env.verbose == 'true') {
          console.log(stderr || stdout)
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
): Promise<number> => {
  const [command, ...commandArguments] = cmd.split(' ')
  return new Promise((resolve) =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
      ...options,
    }).on('exit', (exitCode: number) => resolve(exitCode)),
  )
}

export const getPrismaCliPath = (): string => {
  return join(getNodeModules(), '@prisma/cli/build/index.js')
}

export const readFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

export const writeFile = (path: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

export const requireDistant = (name: string): any => {
  // Keep previous env so that the required module doesn't update it
  const previousEnv = { ...process.env }
  const required = require(require.resolve(name, {
    paths: [
      process.cwd() + '/node_modules/',
      process.cwd(),
      ...(require.main?.paths || []),
      __dirname + '/../../../',
    ],
  }))
  process.env = previousEnv
  return required
}

export const useYarn = (): Promise<boolean> => {
  return pathExists(process.cwd() + '/yarn.lock')
}

export const runPrisma = async (cmd: string, options?: ExecOptions) => {
  const cmdStr =
    'npx prisma ' +
    (cmd.includes('migrate') || cmd.includes('studio')
      ? cmd + ' --experimental'
      : cmd)

  await runShell(cmdStr, options)
}
