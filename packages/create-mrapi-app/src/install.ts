import { exec } from 'child_process'

const execa = async (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string | undefined } },
): Promise<string | Buffer> => {
  if (process.env.verbose === 'true') {
    console.log('  $> ' + cmd)
  }

  return await new Promise((resolve, reject) => {
    exec(
      cmd,
      options,
      (
        error: Error | null,
        stdout: string | Buffer,
        stderr: string | Buffer,
      ) => {
        if (process.env.verbose === 'true') {
          console.log(stderr || stdout)
        }
        if (error) reject(error)
        resolve(stdout)
      },
    )
  })
}

export const useYarn = async () => {
  return await execa('yarn --version')
    .then(() => true)
    .catch(() => false)
}

export const install = async (targetDir: string) => {
  const yarnOrNpm = (await useYarn()) ? 'yarn install' : 'npm install'
  console.log('Installing dependencies...')
  await execa(yarnOrNpm, {
    cwd: targetDir,
  })
}
