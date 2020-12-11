const { resolve } = require('path')
const { readdir, unlink, writeFile, mkdir, access } = require('fs').promises

async function clean (root = './results') {
  const files = await readdir(root)
  for (let file of files) {
    await unlink(resolve(root, file))
  }
}

module.exports = {
  clean,
  readdir,
  unlink,
  writeFile,
  mkdir,
  access,
}
