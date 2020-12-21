// Inspired by: https://github.com/lukeed/trouter

import type {
  Route,
  Pattern,
  HTTPMethod,
  FindResult,
  RouterOptions,
} from './types'

import parse from 'regexparam'

export class Router<T = any> {
  routes: Array<Route<T>> = []
  prefix?: string

  constructor(opts?: RouterOptions) {
    if (opts?.prefix) {
      this.prefix = opts.prefix
    }
  }

  on(method: HTTPMethod | '', route: Pattern, ...fns: T[]) {
    const { keys, pattern } = parse(route as string)
    const handlers = ([] as T[]).concat.apply([], fns)
    this.routes.push({
      keys,
      pattern,
      method: method.toUpperCase() as HTTPMethod,
      handlers,
    })
    return this
  }

  off(method: HTTPMethod, pattern: string | RegExp, handler?: T) {
    for (let i = 0, len = this.routes.length; i < len; i++) {
      const route = this.routes[i]
      const parsed = parse(pattern as string)
      if (
        route.method !== method.toUpperCase() ||
        route.pattern.toString() !== parsed.pattern.toString()
      ) {
        continue
      }
      if (!handler || route.handlers.length === 1) {
        this.routes.splice(i, 1)
        len--
        i--
        continue
      }
      const idx = route.handlers.indexOf(handler)
      if (idx >= 0) {
        this.routes[i].handlers.splice(idx, 1)
      }
    }

    return this
  }

  use(route: Pattern, ...fns: T[]) {
    const handlers = ([] as T[]).concat.apply([], fns)
    const { keys, pattern } = parse(route as string, true)
    this.routes.push({ keys, pattern, method: '', handlers })
    return this
  }

  find(method: HTTPMethod, url: string): FindResult<T> {
    const isHEAD = method === 'HEAD'
    let i = 0
      let j = 0
      let k
      let tmp
      const arr = this.routes
    let matches: RegExpExecArray | never[] | null = []
      const params: { [k: string]: any } = {}
      let handlers: T[] = []
    for (; i < arr.length; i++) {
      tmp = arr[i]
      if (
        tmp.method.length === 0 ||
        tmp.method === method ||
        (isHEAD && tmp.method === 'GET')
      ) {
        if (tmp.keys === false) {
          matches = tmp.pattern.exec(url)
          if (matches === null) continue
          if (matches.groups !== void 0)
            { for (k in matches.groups) params[k] = matches.groups[k] }
          tmp.handlers.length > 1
            ? (handlers = handlers.concat(tmp.handlers))
            : handlers.push(tmp.handlers[0])
        } else if (tmp.keys.length > 0) {
          matches = tmp.pattern.exec(url)
          if (matches === null) continue
          for (j = 0; j < tmp.keys.length;) params[tmp.keys[j]] = matches[++j]
          tmp.handlers.length > 1
            ? (handlers = handlers.concat(tmp.handlers))
            : handlers.push(tmp.handlers[0])
        } else if (tmp.pattern.test(url)) {
          tmp.handlers.length > 1
            ? (handlers = handlers.concat(tmp.handlers))
            : handlers.push(tmp.handlers[0])
        }
      }
    }

    return { params, handlers }
  }

  // shorthands
  all(pattern: Pattern, ...handlers: T[]) {
    return this.on('', pattern, ...handlers)
  }

  get(pattern: Pattern, ...handlers: T[]) {
    return this.on('GET', pattern, ...handlers)
  }

  head(pattern: Pattern, ...handlers: T[]) {
    return this.on('HEAD', pattern, ...handlers)
  }

  patch(pattern: Pattern, ...handlers: T[]) {
    return this.on('PATCH', pattern, ...handlers)
  }

  options(pattern: Pattern, ...handlers: T[]) {
    return this.on('OPTIONS', pattern, ...handlers)
  }

  connect(pattern: Pattern, ...handlers: T[]) {
    return this.on('CONNECT', pattern, ...handlers)
  }

  delete(pattern: Pattern, ...handlers: T[]) {
    return this.on('DELETE', pattern, ...handlers)
  }

  trace(pattern: Pattern, ...handlers: T[]) {
    return this.on('TRACE', pattern, ...handlers)
  }

  post(pattern: Pattern, ...handlers: T[]) {
    return this.on('POST', pattern, ...handlers)
  }

  put(pattern: Pattern, ...handlers: T[]) {
    return this.on('PUT', pattern, ...handlers)
  }
}

export default <T = any>(opts?: RouterOptions) => new Router<T>(opts)

export * from './types'
