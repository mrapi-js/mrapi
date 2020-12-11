const { resolve } = require('path')
const { fork } = require('child_process')
const { readdir, unlink } = require('fs').promises

const { Queue } = require('./utils')

async function clean (root = './results') {
  const files = await readdir(root)
  for (let file of files) {
    await unlink(resolve(root, file))
  }
}

function runner (done) {
  const process = fork(this.file)
  process.on('close', done)
}

const start = async () => {
  await clean()

  const libs = require('./libs.js')

  const queue = new Queue()

  libs.forEach(file => {
    queue.add(runner.bind({ file: resolve('libs', file) }))
  })
}

start()
