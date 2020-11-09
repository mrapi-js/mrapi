import type { Request, Response } from '@mrapi/app'

export interface Context {
  req: Request
  res: Response
}