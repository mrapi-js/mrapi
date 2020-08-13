import Api from '@mrapi/api'
;(async function () {
  const api = new Api()
  await api.start()
})().catch((err) => {
  console.error(err)
})
