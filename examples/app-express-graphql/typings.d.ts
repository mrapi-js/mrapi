import { Req, Res, HTTPVersion } from '@mrapi/app'

declare module 'express-graphql' {
  type Request<V extends HTTPVersion> = Req<V>
  type Response<V extends HTTPVersion> = Res<V> & {
    json?: (data: unknown) => void
  }
  type Middleware<V extends HTTPVersion> = (
    request: Req<V>,
    response: Res<V>,
  ) => Promise<void>

  export function graphqlHTTP<V extends HTTPVersion>(
    options: Options,
  ): Middleware<V>
}
