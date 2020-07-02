import { createLogger } from '@mrapi/core'

const serverConfig = require('../../config/server')

export default createLogger(serverConfig.options.logger)
