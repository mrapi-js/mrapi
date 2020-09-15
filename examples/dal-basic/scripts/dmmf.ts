import path from 'path'
import prettier from 'prettier'
import fs from 'fs-extra'

const fileName = 'three'

// config.outputDir + fileName
const prismaClientPath = path.join(
  process.cwd(),
  'node_modules/.prisma-mrapi',
  fileName
)

const dmmf = prettier.format(JSON.stringify(require(prismaClientPath).dmmf), {
  parser: 'json'
})

fs.outputFileSync(path.join(prismaClientPath, 'dmmf.json'), dmmf)
