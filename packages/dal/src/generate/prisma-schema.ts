import type { mrapi } from '../types'

import { join } from 'path'
import { fs } from '@mrapi/common'

import { defaultDatabaseTypes } from '../config'

export default async function generatePrismaSchema({
  name,
  paths,
  provider,
  cwd = process.cwd(),
}: {
  name: string
  paths: mrapi.PathObject
  provider: string
  cwd?: string
}) {
  const outputDir = join(paths.output, name)
  const outputSchemaPath = `${outputDir}.prisma`

  // clean
  await fs.remove(outputDir)
  await fs.remove(outputSchemaPath)

  const inputSchemaPath = join(paths.input, `${name}.prisma`)
  const inputSchemaFileContent = await fs.readFile(inputSchemaPath, 'utf8')
  /// Get file content without comments
  const pureSchemaFile = getNoCommentContent(inputSchemaFileContent)
  /// Get custom datasource provider from file content
  const providerFromFile = getCustomProvider(pureSchemaFile)
  /// For judging whether or not there's custom datasource provider in content
  const isCustomProvider = provider || providerFromFile || false
  let supportProviders: mrapi.dal.DatabaseType[] = provider
    ? (provider.trim().split(',') as mrapi.dal.DatabaseType[])
    : providerFromFile || defaultDatabaseTypes

  if (isScalarTypeArrayOccurs(pureSchemaFile)) {
    if (
      isCustomProvider &&
      (supportProviders.length > 1 || !supportProviders.includes('postgresql'))
    ) {
      throw new Error(
        'If primitive array occurs, provider can only be "postgresql".',
      )
    }
    supportProviders = ['postgresql']
  } else {
    const index = supportProviders.indexOf('sqlite')
    if (
      index > -1 &&
      isNormalTypeOccurs(
        pureSchemaFile,
        '(\\s+Json\\s*\\[\\]|\\s+Json\\s*|\\n\\s*enum\\s+)',
      )
    ) {
      if (isCustomProvider) {
        throw new Error(
          'If "Json" or "enum" occurs, provider can not be "sqlite".',
        )
      }
      supportProviders.splice(index, 1)
    }
  }

  // if there is no provider avaliable, throw error.
  if (supportProviders.length <= 0) {
    throw new Error(
      'Datasource provider can not be empty, please check if or not current connector can support this kind of grammer in your schema.',
    )
  }

  await fs.outputFile(
    outputSchemaPath,
    createSchemaPrisma(
      outputDir,
      getNoDatasourceContent(inputSchemaFileContent),
      supportProviders,
    ),
    {
      encoding: 'utf8',
    },
  )

  return { outputDir, outputSchemaPath }
}

// Remove comments from file content
function getNoCommentContent(content: string): string {
  const commentPattern = /\s*(\/){2,}.*/g
  return content.replace(commentPattern, '')
}

// Get datasource provider from file content
function getCustomProvider(content: string): mrapi.dal.DatabaseType[] {
  const providerPattern = /\s*datasource\s+([^}]*)provider\s*=\s*((.*)?)\n[^}]*\}/g
  const matchStr = providerPattern.exec(content)

  if (matchStr !== null) {
    // The second sub-expression is the provider
    const customInput = JSON.parse(matchStr[2])

    if (Array.isArray(customInput)) {
      return customInput
    }

    return [customInput as mrapi.dal.DatabaseType]
  }

  return null
}

// Remove custom datasource from file content
function getNoDatasourceContent(content: string): string {
  const datasourcePattern = /\s*datasource\s+([^}]*)\}/g
  return content.replace(datasourcePattern, '')
}

function isScalarTypeArrayOccurs(content: string): boolean {
  // Judge whether or not enum array occurs.
  const enumDefined = new RegExp('\\n\\s*enum\\s+(([a-z]*[A-Z]*)?)\\s*{', 'g')
  const enumTypeNameArr = []
  let result
  while ((result = enumDefined.exec(content)) != null) {
    enumTypeNameArr.push(result[1].trim())
  }
  if (enumTypeNameArr.length !== 0) {
    if (
      isNormalTypeOccurs(
        content,
        '\\s+(' + enumTypeNameArr.join('|') + ')\\s*\\[\\]',
      )
    ) {
      return true
    }
  }

  // Primitive array judgement.
  return isNormalTypeOccurs(
    content,
    '\\s+(Json|String|Boolean|Int|Float|DateTime)\\s*\\[\\]',
  )
}

function isNormalTypeOccurs(content: string, patternStr: string): boolean {
  const pattern = new RegExp('.*' + patternStr, 'g')

  return pattern.exec(content) !== null
}

// Prisma generator cannot recongize path like 'c:\xxx\xxx', but join will produce path like that in windows.
// So here has a special process with param - output.
const createSchemaPrisma = (
  output: string,
  content: string,
  provider: mrapi.dal.DatabaseType[],
) => `
generator client {
  provider = "prisma-client-js"
  output   = "${output.replace(/\\/gi, '/')}"
  previewFeatures = ["transactionApi"]
}

datasource db {
  provider = ["${provider.join('", "')}"]
  url      = env("DATABASE_URL")
}

${content}
`
