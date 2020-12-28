import { App } from '../../../src'
import { createServer } from 'http'
import { middlewareApp } from './middleware-app'
import { logger } from '../../../src/logger'

const testServer = createServer()
export const noPortApp = new App({ cache: 3000, server: testServer, logger })
noPortApp.use('/v1', middlewareApp).get('/test', (_req, res) => {
  res.send('test empty')
})
noPortApp.get('/user', (_req, res) => {
  res.send({ user: 'clik' })
})
noPortApp.get('/foo/:id', (req, res) => {
  res.end(`foo  ${req.params.id} `)
})
