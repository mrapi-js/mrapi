const { resolve } = require('path')
const { fs } = require('@mrapi/common')
const TJS = require('typescript-json-schema')

async function generate (id) {
  const settings = {
    // ref: false,
    aliasRef: true,
    topRef: true,
    // titles: 'dal',
    // defaultProps: true,
    noExtraProps: true,
    // propOrder: true,
    typeOfKeyword: true,
    required: true,
    // strictNullChecks: true,
    ignoreErrors: true,
    // out: '',
    // validationKeywords: [],
    // include: [],
    excludePrivate: true,
    // uniqueNames: true,
    // rejectDateType: true,
    // id: '',
    // defaultNumberType: 'number',
  }

  // optionally pass ts compiler options
  const compilerOptions = {
    strictNullChecks: true,
    esModuleInterop: true,
  }
  const basePath = './'
  const outputFile = `./schemas/${id}.json`

  const program = TJS.getProgramFromFiles(
    [resolve('./src/types.ts')],
    compilerOptions,
    basePath,
  )

  // We can either get the schema for one file and one type...
  const schema = TJS.generateSchema(program, `mrapi.${id}.Options`, settings)
  await fs.ensureFile(outputFile)
  await fs.outputJSON(outputFile, schema)
  console.log(`'${outputFile}' generated successfully`)
}

;(async () => {
  const targets = ['dal', 'generate']
  try {
    for (const id of targets) {
      await generate(id)
    }
  } catch (err) {
    console.log(err)
  }
})()
