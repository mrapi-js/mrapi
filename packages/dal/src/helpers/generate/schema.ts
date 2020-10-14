import type { mrapi } from '../../types'

import { fs } from '@mrapi/common'

import { defaultDatabaseTypes } from '../../config'

export default async function generateSchema({
  paths,
  provider,
  logger,
}: Partial<mrapi.dal.ServiceOptions> & {
  provider: string
  logger?: mrapi.Logger
}) {
  const inputSchemaFileContent = await fs.readFile(paths.inputSchema, 'utf8')
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
      logger.error(
        'If primitive array occurs, provider can only be "postgresql".',
      )
      process.exit()
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
        logger.error(
          'If "Json" or "enum" occurs, provider can not be "sqlite".',
        )
        process.exit()
      }
      supportProviders.splice(index, 1)
    }
  }

  // if there is no provider avaliable, throw error.
  if (supportProviders.length <= 0) {
    logger.error(
      'Datasource provider can not be empty, please check if or not current connector can support this kind of grammer in your schema.',
    )
    process.exit()
  }

  const prismaSchema = createSchemaPrisma(
    paths.outputPrismaClient,
    getNoDatasourceContent(inputSchemaFileContent),
    supportProviders,
  )

  await fs.outputFile(paths.outputSchema, prismaSchema, {
    encoding: 'utf8',
  })
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
datasource db {
  provider = ["${provider.join('", "')}"]
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  output          = "${output.replace(/\\/gi, '/')}"
  binaryTargets   = [ "native" ]
  previewFeatures = [ "transactionApi", "connectOrCreate", "atomicNumberOperations" ]
}

${content}
`
