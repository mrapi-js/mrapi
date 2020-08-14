/**
 * decription: API configs
 *
 * @param {Object} server http server config
 * @param {Number} server.port http server listen port
 * @param {String} server.type enum[standalone,combine]
 * @param {Object} openapi openapi config
 * @param {String} openapi.dir custome openapi dir
 * @param {String} openapi.dalBaseUrl dal base url
 * @param {String} openapi.prefix custome openapi prefix
 * @param {Object} graphql custome graphql config
 * @param {String} graphql.dir custome graphql dir
 *
 */

export default {
  server: {
    port: 1358,
    type: 'standalone',
  },
  openapi: {
    dir: '/src/openapi',
    dalBaseUrl: 'http://localhost:8080',
    prefix: '/api',
  },
  graphql: {
    dir: '/src/graphql',
  },
  sources: [],
}
