# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.8.2"></a>
## [0.8.2](https://github.com/mrapi-js/mrapi/compare/v0.8.1...v0.8.2) (2020-07-27)


### Bug Fixes

* **core:** Cannot return null for non-nullable field *.count ([4ce9530](https://github.com/mrapi-js/mrapi/commit/4ce9530))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/mrapi-js/mrapi/compare/v0.8.0...v0.8.1) (2020-07-09)


### Bug Fixes

* **create-mrapi-app:** dynamic update template deps version ([7fb7b6e](https://github.com/mrapi-js/mrapi/commit/7fb7b6e))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/mrapi-js/mrapi/compare/v0.7.5...v0.8.0) (2020-07-09)


### Features

* support prisma v2.2.0 ([76e8d97](https://github.com/mrapi-js/mrapi/commit/76e8d97))



<a name="0.7.5"></a>
## [0.7.5](https://github.com/mrapi-js/mrapi/compare/v0.7.4...v0.7.5) (2020-07-05)



<a name="0.7.4"></a>
## [0.7.4](https://github.com/mrapi-js/mrapi/compare/v0.7.3...v0.7.4) (2020-07-05)



<a name="0.7.3"></a>
## [0.7.3](https://github.com/mrapi-js/mrapi/compare/v0.7.2...v0.7.3) (2020-07-05)



<a name="0.7.2"></a>
## [0.7.2](https://github.com/mrapi-js/mrapi/compare/v0.7.1...v0.7.2) (2020-07-05)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/mrapi-js/mrapi/compare/v0.7.0...v0.7.1) (2020-07-05)



<a name="0.7.0"></a>
# 0.7.0 (2020-07-05)


### Bug Fixes

* **core:** 'id' lack error ([102acdb](https://github.com/mrapi-js/mrapi/commit/102acdb))
* add root package.json name ([fab28d3](https://github.com/mrapi-js/mrapi/commit/fab28d3))
* add root package.json version ([2cf5cf3](https://github.com/mrapi-js/mrapi/commit/2cf5cf3))
* multi-tenant bugs ([83e152c](https://github.com/mrapi-js/mrapi/commit/83e152c))
* set app packages private ([a78eca0](https://github.com/mrapi-js/mrapi/commit/a78eca0))
* **core:** [WIP] swagger docs ([59f536b](https://github.com/mrapi-js/mrapi/commit/59f536b))
* **core:** expose error details ([1edd99b](https://github.com/mrapi-js/mrapi/commit/1edd99b))
* **core:** Option destructuring error ([0f67973](https://github.com/mrapi-js/mrapi/commit/0f67973))
* **core:** prisma query arguments 'skip','first','last' must be a positive integer ([33f4e88](https://github.com/mrapi-js/mrapi/commit/33f4e88))
* **core:** query params validate for openapi ([fc7b64a](https://github.com/mrapi-js/mrapi/commit/fc7b64a))
* **core:** remove auth hook ([ce9a18c](https://github.com/mrapi-js/mrapi/commit/ce9a18c))
* **core:** support __typename in apollo-client ([097beb6](https://github.com/mrapi-js/mrapi/commit/097beb6))
* **core:** this.app.oas is not a function ([9e9e5e7](https://github.com/mrapi-js/mrapi/commit/9e9e5e7))
* **prisma:** command 'generate' hangs ([0ba9d31](https://github.com/mrapi-js/mrapi/commit/0ba9d31))
* **prisma:** ignore empty model ([8959058](https://github.com/mrapi-js/mrapi/commit/8959058))
* **template:** temporary disable graphql-jit, fix memory leak caused by 'very long string' ([f904a99](https://github.com/mrapi-js/mrapi/commit/f904a99))
* **template:** update deps ([f218161](https://github.com/mrapi-js/mrapi/commit/f218161))
* **template:** update mrapi version ([c036568](https://github.com/mrapi-js/mrapi/commit/c036568))
* --ignore => --ignore-changes ([63bbe62](https://github.com/mrapi-js/mrapi/commit/63bbe62))
* add [@types](https://github.com/types)/graphql-type-json ([2330d3d](https://github.com/mrapi-js/mrapi/commit/2330d3d))
* expose errors of graphql plugin ([c2f0be2](https://github.com/mrapi-js/mrapi/commit/c2f0be2))
* **template:** update deps ([839ffec](https://github.com/mrapi-js/mrapi/commit/839ffec))
* add missing resource ([e776026](https://github.com/mrapi-js/mrapi/commit/e776026))
* upgrade prisma version; add seed.ts; fix generate bug on windows ([826db6c](https://github.com/mrapi-js/mrapi/commit/826db6c))


### Features

* support multi-tenant ([c4e5ab5](https://github.com/mrapi-js/mrapi/commit/c4e5ab5))
* **core:** add 'noIntrospection' option for graphql; update deps ([c6d4577](https://github.com/mrapi-js/mrapi/commit/c6d4577))
* **core:** move prisma __internal config to core ([9fd996d](https://github.com/mrapi-js/mrapi/commit/9fd996d))
* **core:** multiTenant supports ([191e8b8](https://github.com/mrapi-js/mrapi/commit/191e8b8))
* **core:** rest:add pagination support ([04481e5](https://github.com/mrapi-js/mrapi/commit/04481e5))
* **core:** Separate plugin configuration ([0235c7f](https://github.com/mrapi-js/mrapi/commit/0235c7f))
* **core:** support custom RESTFul APIs ([ff8db3b](https://github.com/mrapi-js/mrapi/commit/ff8db3b))
* **core:** support full-config of type-graphql,fastify server ([b529c1c](https://github.com/mrapi-js/mrapi/commit/b529c1c))
* **core:** type-graphql globalMiddlewares performance optimization;noIntrospection optimization; ([d210b6e](https://github.com/mrapi-js/mrapi/commit/d210b6e))
* [WIP] generate router config ([d73687a](https://github.com/mrapi-js/mrapi/commit/d73687a))
* **core:** readd errorHandler for fastify-gql ([cea5c02](https://github.com/mrapi-js/mrapi/commit/cea5c02))
* **core:** support RESTFul APIs ([d714a63](https://github.com/mrapi-js/mrapi/commit/d714a63))
* **core:** support to configure which graphql APIs are exposed; add global uniform logger ([f881790](https://github.com/mrapi-js/mrapi/commit/f881790))
* **template:** update verison ([92d3412](https://github.com/mrapi-js/mrapi/commit/92d3412))
* add demo ([8d3cba3](https://github.com/mrapi-js/mrapi/commit/8d3cba3))
* node env supports; add dockerfile in tempalte ([2acbaf9](https://github.com/mrapi-js/mrapi/commit/2acbaf9))
* Programmatic configuration ([f61e5f3](https://github.com/mrapi-js/mrapi/commit/f61e5f3))
* update graphql to 15.0.0 ([ea69ed1](https://github.com/mrapi-js/mrapi/commit/ea69ed1))
* **create-mrapi-app:** add debug config for vscode ([611e672](https://github.com/mrapi-js/mrapi/commit/611e672))
* **template:** update deps ([905c28d](https://github.com/mrapi-js/mrapi/commit/905c28d))
