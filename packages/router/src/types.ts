export type Pattern = string | RegExp

export interface RouterOptions {
  prefix?: string
}

export interface Route<T> {
  keys: Array<string> | false
  pattern: RegExp
  method: HTTPMethod | ''
  handlers: Array<T>
}

export interface FindResult<T> {
  params: { [k: string]: string }
  handlers: Array<T>
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
