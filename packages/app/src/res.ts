import type { Request, Response } from './types'

export function send(
  req: Request,
  res: Response,
  data: unknown = '',
) {
  if (req.method === 'HEAD') {
    // skip body for HEAD
    res.end()
    return
  }

  if (res.statusCode === 204 || res.statusCode === 304) {
    res.removeHeader('Content-Type')
    res.removeHeader('Content-Length')
    res.end('')
    return
  }

  switch (typeof data) {
    // string defaulting to html
    case 'string':
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/html; charset=utf8')
      }
      break
    case 'boolean':
    case 'number':
    case 'object':
      if (data === null) {
        data = ''
      } else if (Buffer.isBuffer(data)) {
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/octet-stream')
        }
      } else {
        data = JSON.stringify(data)
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
        }
      }
      break
  }

  res.end(data as string)
  return
}

export function status(res: Response, code: number) {
  res.statusCode = code
  return res
}

/**
 * For express compatibility
 *
 * links()
 * json()
 * jsonp()
 * sendStatus()
 * sendFile()
 * download()
 * type()
 * contentType()
 * format()
 * attachment()
 * append()
 * set()
 * header()
 * get()
 * clearCookie()
 * cookie()
 * location()
 * redirect()
 * vary()
 * render()
 */
