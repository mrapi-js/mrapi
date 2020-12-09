import { findManyFilter } from '../src/openapi/filters'
import { makeOpenapi, makeOpenapiOptions } from '../src/openapi'
import { dependenciesPlugins } from '../src/openapi/dependencies'

const fakeModelName = 'user'
const fakeReq = {
  body: { username: 'leozmli' },
  query: { username: 'leozmli' },
}
const fakeInst = { id: '1', username: 'leozmli' }
function fakeCreate (params: any) {
  return new Promise(resolve => {
    if (params.data.username) resolve(fakeInst)
  })
}
// function fakeFindMany (params: any) {
//   return new Promise(resolve => {
//     if (params.data.username) resolve(fakeInst)
//   })
// }
// function fakeCount (params: any) {
//   return new Promise(resolve => {
//     if (params.data.username) resolve(1)
//   })
// }
function fakeDBClient (req: any) {
  return function () {
    return {
      req,
      [fakeModelName]: {
        create: fakeCreate,
        // findMany: fakeFindMany,
        // count: fakeCount,
      },
    }
  }
}

// ====== dependenciesPlugins ====== //

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
    data: fakeInst,
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

// test('dependenciesPlugins findMany', async () => {
//   expect(
//     await dependenciesPlugins(fakeDBClient(fakeReq)).findMany(
//       fakeReq,
//       null,
//       null,
//       {
//         modelName: fakeModelName,
//       },
//     ),
//   ).toEqual({
//     code: 0,
//     data: fakeInst,
//   })
// })

test('dependenciesPlugins check', () => {
  expect(() => {
    dependenciesPlugins(undefined)
  }).toThrow()
})

describe('openapi', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('makeOpenapi', async () => {
    expect(typeof makeOpenapi).toBe('function')

    // makeOpenapi(app, makeOpenapiOptions(), )
  })

  test('makeOpenapiOptions', () => {
    expect(typeof makeOpenapiOptions).toBe('function')
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

  test('getParams', () => {
    const result = findManyFilter.getParams({
      x: 1,
      y: 2,
      skip: 3,
      filtering: true,
    })
    expect(result.skip).toEqual(3)
  })
})
