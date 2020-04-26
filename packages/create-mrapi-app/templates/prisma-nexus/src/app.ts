import 'reflect-metadata'
import { Mrapi } from '@mrapi/core'

async function main() {
  const mrapi = new Mrapi()
  mrapi.start()
}
main().catch(console.error)
