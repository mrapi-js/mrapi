import { dirname } from 'path'
import { tryRequire } from './utils'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

export function compileTSFile(src: string, dest: string) {
  if (!existsSync(src)) {
    return ''
  }

  const {
    transpileModule,
    ModuleKind,
  }: typeof import('typescript') = tryRequire(
    'typescript',
    'Please install it manually.',
  )

  const source = readFileSync(src, { encoding: 'utf-8' })
  const result = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  })

  if (!result || !result.outputText) {
    return ''
  }

  const destDir = dirname(dest)
  !existsSync(destDir) && mkdirSync(destDir, { recursive: true })
  writeFileSync(dest, result.outputText)

  return dest
}
