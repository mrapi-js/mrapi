import { App } from '../../../src'
const cache: any = 'testStringCache'
export const http2ErrorApp = new App({ cache: cache, http2: true })
