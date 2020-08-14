export default {
  server: {
    port: 1358,
    type: 'standalone',
  },
  openapi: {
    dalBaseUrl: 'http://localhost',
  },
  sources: [
    {
      name: 'auth',
      endpoint: 'http://localhost:4003/graphql', // should be replaced
      prefix: 'auth_',
      snapshot: false,
    },
  ],
}
