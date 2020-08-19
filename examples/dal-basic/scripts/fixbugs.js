const fs = require('fs')

// 默认认为包存在...
const version = require('create-nexus-type/package.json').version

if (version === '1.2.5') {
  // 创建读取流
  const readable = fs.createReadStream(require.resolve('./schema.js'))
  // 创建写入流
  const writable = fs.createWriteStream(
    require.resolve('create-nexus-type/src/schema.js')
  )
  // 通过管道来传输流
  readable.pipe(writable)

  console.log('copy file "schema.js" to fix bug.')
}
