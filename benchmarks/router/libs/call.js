'use strict'

const {
  title,
  now,
  print,
  operations,
  writeResult,
  getMemoryUsage,
} = require('../utils')
const call = require('call')
const router = new call.Router()
const name = 'call'

title(name)

const routes = [
  { method: 'GET', path: '/user' },
  { method: 'GET', path: '/user/comments' },
  { method: 'GET', path: '/user/avatar' },
  { method: 'GET', path: '/user/lookup/username/{username}' },
  { method: 'GET', path: '/user/lookup/email/{address}' },
  { method: 'GET', path: '/event/{id}' },
  { method: 'GET', path: '/event/{id}/comments' },
  { method: 'POST', path: '/event/{id}/comment' },
  { method: 'GET', path: '/map/{location}/events' },
  { method: 'GET', path: '/status' },
  { method: 'GET', path: '/very/deeply/nested/route/hello/there' },
  { method: 'GET', path: '/static/{file*}' },
]

function noop () {}
var i = 0
var time = 0

routes.forEach(route => {
  router.add(route, noop)
})

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/user')
}
print('short static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/user/comments')
}
print('static with same radix', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/user/lookup/username/john')
}
print('dynamic route', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/event/abcd1234/comments')
}
print('mixed static dynamic', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/very/deeply/nested/route/hello/there')
}
print('long static', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/static/index.html')
}
print('wildcard', time, name)

time = now()
for (i = 0; i < operations; i++) {
  router.route('get', '/user')
  router.route('get', '/user/comments')
  router.route('get', '/user/lookup/username/john')
  router.route('get', '/event/abcd1234/comments')
  router.route('get', '/very/deeply/nested/route/hello/there')
  router.route('get', '/static/index.html')
}
print('all together', time, name)
getMemoryUsage(process)
writeResult(name)
