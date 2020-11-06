const path = require('path')
const autocannon = require('autocannon')
const compare = require('autocannon-compare')

const { writeFile, mkdir, access } = require('./utils')

const resultsDirectory = path.join(process.cwd(), 'results')

const run = (opts = {}) =>
  new Promise((resolve, reject) => {
    opts.url = 'http://localhost:1358/graphql?query={users{id}}'
    autocannon(opts, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })

const writeResult = async (handler, result) => {
  try {
    await access(resultsDirectory)
  } catch (e) {
    await mkdir(resultsDirectory)
  }

  result.server = handler

  const dest = path.join(resultsDirectory, `${handler}.json`)
  return writeFile(dest, JSON.stringify(result))
}

module.exports.fire = async (opts, handler, save) => {
  const result = await run(opts)
  return save ? writeResult(handler, result) : null
}

module.exports.compare = (a, b) => {
  const resA = require(`${resultsDirectory}/${a}.json`)
  const resB = require(`${resultsDirectory}/${b}.json`)
  const comp = compare(resA, resB)
  if (comp.equal) {
    return true
  } else if (comp.aWins) {
    return {
      diff: comp.requests.difference,
      fastest: a,
      slowest: b,
      fastestAverage: resA.requests.average,
      slowestAverage: resB.requests.average,
    }
  }
  return {
    diff: compare(resB, resA).requests.difference,
    fastest: b,
    slowest: a,
    fastestAverage: resB.requests.average,
    slowestAverage: resA.requests.average,
  }
}
