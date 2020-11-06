'use strict'

const {
  title,
  now,
  print,
  operations,
  writeResult,
  getMemoryUsage,
} = require('../utils')
const router = require('express/lib/router')()

const name = 'express'
title(`${name} (WARNING: includes handling)`)

const routes = [
  { method: 'GET', url: '/user' },
  { method: 'GET', url: '/user/comments' },
  { method: 'GET', url: '/user/avatar' },
  { method: 'GET', url: '/user/lookup/username/:username' },
  { method: 'GET', url: '/user/lookup/email/:address' },
  { method: 'GET', url: '/event/:id' },
  { method: 'GET', url: '/event/:id/comments' },
  { method: 'POST', url: '/event/:id/comment' },
  { method: 'GET', url: '/map/:location/events' },
  { method: 'GET', url: '/status' },
  { method: 'GET', url: '/very/deeply/nested/route/hello/there' },
  { method: 'GET', url: '/static/*' },
]

function noop () {}
var i = 0
var time = 0

routes.forEach(route => {
  if (route.method === 'GET') {
    router.route(route.url).get(noop)
  } else {
    router.route(route.url).post(noop)
  }
})

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/user' })
}
print('short static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/user/comments' })
}
print('static with same radix', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/user/lookup/username/john' })
}
print('dynamic route', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/event/abcd1234/comments' }, null, noop)
}
print('mixed static dynamic', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle(
    { method: 'GET', url: '/very/deeply/nested/route/hello/there' },
    null,
    noop,
  )
}
print('long static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/static/index.html' }, null, noop)
}
print('wildcard', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.handle({ method: 'GET', url: '/user' })
  router.handle({ method: 'GET', url: '/user/comments' })
  router.handle({ method: 'GET', url: '/user/lookup/username/john' })
  router.handle({ method: 'GET', url: '/event/abcd1234/comments' }, null, noop)
  router.handle(
    { method: 'GET', url: '/very/deeply/nested/route/hello/there' },
    null,
    noop,
  )
  router.handle({ method: 'GET', url: '/static/index.html' }, null, noop)
}
print('all together', time, name)
getMemoryUsage(process)
writeResult(name)
