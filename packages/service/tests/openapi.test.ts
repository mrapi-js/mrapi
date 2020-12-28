import { findManyFilter } from '../src/openapi/filters'
import { makeOpenapi, makeOpenapiOptions } from '../src/openapi'
import { dependenciesPlugins } from '../src/openapi/dependencies'
import { App } from '@mrapi/app'
import { Datasource, DatasourceOptions } from '@mrapi/datasource'
import { ServiceOptions } from '@mrapi/types'
import { join } from 'path'

const fakeApp = new App()
const fakeDatasource = new Datasource({
  provider: 'prisma' as any,
  management: {
    database: 'file:./dev.db',
    clientPath: '.prisma/management-client',
  },
  services: [
    {
      name: 'a',
      database: 'file:./dev.db',
      clientPath: '.prisma/a-client',
    },
    {
      name: 'b',
      database: 'file:./dev.db',
      clientPath: '.prisma/b-client',
    },
  ],
} as DatasourceOptions)
const fakeService = {
  name: 'cyrus',
  database: 'file:./dev.db',
  clientPath: '.prisma/a-client',
  customDir: 'openapi',
  sources: [{ name: 'openapi', type: 'openapi', endpoint: 'openapi' }],
  schema: 'database-url',
  tenants: [{ name: 'cyrus' }],
  contextFile: 'openapi',
  openapi: { output: join(__dirname, './definitions'), custom: 'openapi' },
} as ServiceOptions
const fakeService2 = {
  name: 'cyrus',
  database: 'file:./dev.db',
  clientPath: '.prisma/a-client',
  customDir: 'openapi',
  sources: [{ name: 'openapi', type: 'openapi', endpoint: 'openapi' }],
  schema: 'database-url',
  tenants: [{ name: 'cyrus' }],
  contextFile: 'openapi',
  openapi: { output: '', custom: 'openapi' },
} as ServiceOptions
const fakeModelName = 'user'
const fakeReq = {
  body: { username: 'cyrusyjli' },
  query: {
    id: '1',
    username: 'cyrusyjli',
    where: '{"name": "cyrus"}',
    skip: 3,
  },
  params: { usename: 'cyrusyjli' },
}
const fakeRes = { id: '1', username: 'cyrusyjli' }

function fakeCreate(params: any) {
  return new Promise((resolve) => {
    if (params.data.username) resolve(fakeRes)
  })
}
function fakeFindMany(params: any) {
  return new Promise((resolve) => {
    if (params) resolve(1)
  })
}
function fakeCount(params: any) {
  return new Promise((resolve) => {
    if (params) resolve(1)
  })
}
function fakeFindUnique(params: any) {
  return new Promise((resolve) => {
    if (params.where) resolve(1)
  })
}
function fakeUpdate(params: any) {
  return new Promise((resolve) => {
    if (params.data.username) resolve(1)
  })
}
function fakeDelete(params: any) {
  return new Promise((resolve) => {
    if (params.where) resolve(1)
  })
}
function fakeDBClient(req: any) {
  return function () {
    return {
      req,
      [fakeModelName]: {
        create: fakeCreate,
        findMany: fakeFindMany,
        count: fakeCount,
        findUnique: fakeFindUnique,
        update: fakeUpdate,
        delete: fakeDelete,
      },
    }
  }
}

function fakeGetTenantIdentity(req: any, res: any, service: any) {
  return new Promise((resolve) => {
    if (req && res && service) resolve(1)
  })
}

// ====== dependenciesPlugins ====== //
describe('dependenciesPlugins', () => {
  test('dependenciesPlugins findMany', async () => {
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).findMany(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName,
        },
      ),
    ).toEqual({
      code: 0,
      data: {
        list: 1,
        total: 1,
      },
    })
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).findMany(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName + 1,
        },
      ),
    ).toEqual({
      code: -1,
      message: "Cannot read property 'findMany' of undefined",
    })
  })

  test('dependenciesPlugins create', async () => {
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).create(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName,
        },
      ),
    ).toEqual({
      code: 0,
      data: fakeRes,
    })

    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).create(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName + 1,
        },
      ),
    ).toEqual({
      code: -1,
      message: "Cannot read property 'create' of undefined",
    })
  })

  test('dependenciesPlugins findUnique', async () => {
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).findUnique(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName,
        },
      ),
    ).toEqual({
      code: 0,
      data: 1,
    })

    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).findUnique(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName + 1,
        },
      ),
    ).toEqual({
      code: -1,
      message: "Cannot read property 'findUnique' of undefined",
    })
  })

  test('dependenciesPlugins update', async () => {
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).update(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName,
        },
      ),
    ).toEqual({
      code: 0,
      data: 1,
    })

    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).update(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName + 1,
        },
      ),
    ).toEqual({
      code: -1,
      message: "Cannot read property 'update' of undefined",
    })
  })

  test('dependenciesPlugins delete', async () => {
    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).delete(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName,
        },
      ),
    ).toEqual({
      code: 0,
      data: 1,
    })

    expect(
      await dependenciesPlugins(fakeDBClient(fakeReq)).delete(
        fakeReq,
        null,
        null,
        {
          modelName: fakeModelName + 1,
        },
      ),
    ).toEqual({
      code: -1,
      message: "Cannot read property 'delete' of undefined",
    })
  })

  test('dependenciesPlugins check', () => {
    expect(() => {
      dependenciesPlugins(undefined)
    }).toThrow()
  })
})

describe('openapi', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('makeOpenapi', async () => {
    expect(typeof makeOpenapi).toBe('function')
    expect(typeof makeOpenapi(fakeApp, {}, 'test')).toBe('object')
  })

  test('makeOpenapiOptions', () => {
    expect(typeof makeOpenapiOptions).toBe('function')
    expect(
      typeof makeOpenapiOptions(
        fakeService,
        fakeGetTenantIdentity,
        fakeDatasource,
      ),
    ).toBe('object')
    expect(
      typeof makeOpenapiOptions(
        fakeService2,
        fakeGetTenantIdentity,
        fakeDatasource,
      ),
    ).toBe('object')
  })

  // ====== findManyFilter ====== //

  test('findManyFilter', () => {
    expect(typeof findManyFilter).toBe('object')
    expect(findManyFilter.options.filtering).toBeDefined()
    expect(findManyFilter.options.pagination instanceof Array).toBe(true)
    expect(findManyFilter.options.selecting).toBeDefined()
    expect(findManyFilter.options.sorting).toBeDefined()
  })

  test('filterOther', () => {
    expect(
      findManyFilter.filterOther(findManyFilter, 'key', 'val', false),
    ).toBeFalsy()
    expect(
      findManyFilter.filterOther(findManyFilter, 'key', 'val', true),
    ).toBeFalsy()
    expect(
      findManyFilter.filterOther(findManyFilter, 'where', '{"x":1}', true),
    ).toBeTruthy()
  })

  test('filterPagination', () => {
    // pagination: [['take', 'skip'], ['cursor']],
    expect(
      findManyFilter.filterPagination(findManyFilter, 'key', 'val'),
    ).toBeFalsy()
    expect(
      findManyFilter.filterPagination(
        findManyFilter,
        'cursor',
        'cursor=id:xxxx',
        findManyFilter.options.pagination,
      ),
    ).toBeTruthy()
    // include key => take
    expect(
      findManyFilter.filterPagination(
        findManyFilter,
        'skip',
        '1',
        findManyFilter.options.pagination,
      ),
    ).toBeTruthy()
    // throw err
    expect(() => {
      findManyFilter.filterPagination(
        findManyFilter,
        'take',
        'x',
        findManyFilter.options.pagination,
      )
    }).toThrow()
  })

  test('filterSelecting', () => {
    expect(
      findManyFilter.filterSelecting(findManyFilter, 'key', ['val']),
    ).toBeFalsy()
    expect(
      findManyFilter.filterSelecting(findManyFilter, 'select', ['val'], true),
    ).toBeTruthy()
  })

  test('filterSorting', () => {
    expect(
      findManyFilter.filterSorting(findManyFilter, 'key', ['val']),
    ).toBeFalsy()
    expect(
      findManyFilter.filterSorting(
        findManyFilter,
        'orderBy',
        ['sort:=name:asc,id:desc'],
        true,
      ),
    ).toBeTruthy()
    // expect(
    //   findManyFilter.filterSorting(findManyFilter, 'select', ['val'], true),
    // ).toBeTruthy()
  })

  test('getParams filterPagination skip', () => {
    const result = findManyFilter.getParams({
      x: 1,
      y: 2,
      skip: 3,
      filtering: true,
    })
    expect(result.skip).toEqual(3)
  })

  test('getParams filterPagination cursor', () => {
    const result = findManyFilter.getParams({
      cursor: 'name: 1',
    })
    expect(result.cursor).toEqual({ name: 1 })
  })

  test('getParams filterOther', () => {
    const result = findManyFilter.getParams({
      where: '{"name": "cyrus"}',
    })
    expect(result.where).toEqual({ name: 'cyrus' })
  })

  test('getParams filterSorting', () => {
    const result = findManyFilter.getParams({
      orderBy: ['name:asc'],
    })
    expect(result.orderBy).toEqual({ name: 'asc' })
  })

  test('getParams filterSelecting', () => {
    const result = findManyFilter.getParams({
      select: ['name:asc'],
    })
    expect(result.select).toEqual({ 'name:asc': true })
  })
})
