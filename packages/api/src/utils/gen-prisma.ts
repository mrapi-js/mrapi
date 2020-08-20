import fs from 'fs'
import logger from './logger'
import { getConfig, MrapiConfig, runShell } from '@mrapi/common'

function fixBugs() {
  const version = require('create-nexus-type/package.json').version
  if (version === '1.2.5') {
    // 创建读取流
    const readable = fs.createReadStream(require.resolve('../scripts/schema.js'))
    // 创建写入流
    const writable = fs.createWriteStream(
      require.resolve('create-nexus-type/src/schema.js'),
    )
    // 通过管道来传输流
    readable.pipe(writable)

    logger.info('[Start] copy file "schema.js" to fix bug.')
  }
}

export default async function () {
  const config: MrapiConfig = getConfig()
  fixBugs()
  /* eslint-disable */
  await Promise.all(config.schemaNames.map(name => runShell(`npx mrapi generate --name ${name}`)))
}
