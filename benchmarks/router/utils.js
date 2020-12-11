const chalk = require('chalk')
const { resolve } = require('path')
const { writeFileSync } = require('fs')

const operations = 1000000

const result = {}

function setResult (lib, name, time) {
  result[`${lib}`] = result[`${lib}`] || {}
  result[`${lib}`][name] = time
}

function writeResult (name) {
  const fileName = name.replace('@', '').replace('/', '-')
  writeFileSync(
    resolve('results', `${fileName}.json`),
    JSON.stringify(result, null, 2),
  )
  return result
}

function getMemoryUsage (p) {
  const os = require('os')
  // 获取当前Node内存堆栈情况
  const { rss, heapUsed, heapTotal } = p.memoryUsage()
  // 获取系统空闲内存
  const sysFree = os.freemem()
  // 获取系统总内存
  const sysTotal = os.totalmem()

  const usage = {
    sys: ((1 - sysFree / sysTotal) * 100).toFixed(2) + '%', // 系统内存占用率
    heap: ((heapUsed / heapTotal) * 100).toFixed(2) + '%', // Node堆内存占用率
    node: ((rss / sysTotal) * 100).toFixed(2) + '%', // Node占用系统内存的比例
  }
  console.log('Memory usage:', usage)
  return usage
}

function now () {
  var ts = process.hrtime()
  return ts[0] * 1e3 + ts[1] / 1e6
}

function getOpsSec (ms, string = true) {
  return string
    ? Number(((operations * 1000) / ms).toFixed()).toLocaleString()
    : ((operations * 1000) / ms).toFixed() * 1
}

function print (name, time, lib) {
  const nowTime = now()
  // const duration = getOpsSec(now - time)
  setResult(lib, name, getOpsSec(nowTime - time, false))
  console.log(
    chalk.yellow(name).padEnd(35),
    getOpsSec(nowTime - time),
    'ops/sec',
  )
}

function title (name) {
  console.log(chalk.cyan(`\n${name}`))
}

function Queue () {
  this.q = []
  this.running = false
}

Queue.prototype.add = function add (job) {
  this.q.push(job)
  if (!this.running) this.run()
}

Queue.prototype.run = function run () {
  this.running = true
  const job = this.q.shift()
  job(() => {
    if (this.q.length) {
      this.run()
    } else {
      this.running = false
    }
  })
}

module.exports = {
  now,
  getOpsSec,
  print,
  title,
  Queue,
  operations,
  writeResult,
  getMemoryUsage,
}
