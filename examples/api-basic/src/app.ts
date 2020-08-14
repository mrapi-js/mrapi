import Api, { log } from '@mrapi/api'
;(async function () {
  const api = new Api()
  await api.start()
})().catch((err) => {
  log.error(err)
})
