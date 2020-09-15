import pino from 'pino'
import fs from 'fs'
import { Level } from '../types'
import path from 'path'
import pinoms from 'pino-multi-stream'
const { rotator } = require('logrotator')

const logPath = path.join(process.cwd(), 'logs')

// reset logs dir
function deleteall(path: string) {
  let files = []
  if (!fs.existsSync(path)) return fs.mkdirSync(path)
  files = fs.readdirSync(path)
  files.forEach((file) => {
    const curPath = path + '/' + file
    if (fs.statSync(curPath).isDirectory()) {
      // recurse
      deleteall(curPath)
    } else {
      // delete file
      fs.unlinkSync(curPath)
    }
  })
}
deleteall(logPath)
if (!fs.existsSync(logPath)) fs.mkdirSync(logPath)

// output log to console and file
const streams = [
  {
    level: 'info' as Level,
    stream: pino.destination({ dest: `${logPath}/info.log` }),
  },
  {
    level: 'error' as Level,
    stream: pino.destination({ dest: `${logPath}/error.log` }),
  },
  { stream: process.stdout },
]

const log = pino(
  {
    level: 'info' as Level,
    prettyPrint: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'hostname,pid',
    },
  },
  pinoms.multistream(streams),
)

// logrotator file
// https://github.com/capriza/logrotator
const logrotatorOption = {
  schedule: '2h',
  size: '5m',
  compress: false,
  count: 30,
}
rotator.register(`${logPath}/info.log`, logrotatorOption)
rotator.register(`${logPath}/error.log`, logrotatorOption)
rotator.on('error', (err: any) => {
  log.error('[Logrotator] error', err)
})
rotator.on('rotate', (file: string) => {
  log.info('[Logrotator] file ' + file + ' was rotated!')
})

export default log
