export type Pattern = string | RegExp

export interface RouterOptions {
  prefix?: string
}

export interface Route<T> {
  keys: string[] | false
  pattern: RegExp
  method: HTTPMethod | ''
  handlers: T[]
}

export interface FindResult<T> {
  params: { [k: string]: string }
  handlers: T[]
}

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT'
  | 'TRACE'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
