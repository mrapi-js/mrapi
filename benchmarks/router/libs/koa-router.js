'use strict'

const {
  title,
  now,
  print,
  operations,
  writeResult,
  getMemoryUsage,
} = require('../utils')
const Router = require('@koa/router')
const router = new Router()

const name = 'koa-router'
title(name)

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
  { method: 'GET', url: '/static/(.*)' },
]

function noop () {}
var i = 0
var time = 0

routes.forEach(route => {
  if (route.method === 'GET') {
    router.get(route.url, noop)
  } else {
    router.post(route.url, noop)
  }
})

time = now()
for (i = 0; i < operations; i++) {
  router.match('/user', 'GET')
}
print('short static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/user/comments', 'GET')
}
print('static with same radix', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/user/lookup/username/john', 'GET')
}
print('dynamic route', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/event/abcd1234/comments', 'GET')
}
print('mixed static dynamic', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/very/deeply/nested/route/hello/there', 'GET')
}
print('long static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/static/index.html', 'GET')
}
print('wildcard', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.match('/user', 'GET')
  router.match('/user/comments', 'GET')
  router.match('/user/lookup/username/john', 'GET')
  router.match('/event/abcd1234/comments', 'GET')
  router.match('/very/deeply/nested/route/hello/there', 'GET')
  router.match('/static/index.html', 'GET')
}
print('all together', time, name)
getMemoryUsage(process)
writeResult(name)
