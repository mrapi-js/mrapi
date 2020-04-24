import 'reflect-metadata'
import { Mrapi } from 'mrapi'

async function main() {
  const mrapi = new Mrapi()
  mrapi.start()
}
main().catch(console.error)
