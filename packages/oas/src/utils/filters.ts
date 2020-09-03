import { SELECTING, SORTING, FILTERING } from '../constants'

export interface FindManyFilter {
  select?: {}
  include?: {}
  where?: {}
  orderBy?: {}
  cursor?: {}
  take?: number | null
  skip?: number | null
}

export interface CountFilter {
  where?: {}
  orderBy?: {}
  after?: {}
  before?: {}
  skip?: number | null
  first?: number | null
  last?: number | null
}

interface FillterOptions {
  pagination?: string[][] | false
  filtering?: boolean
  selecting?: boolean
  sorting?: boolean
}

const defaultOptions: FillterOptions = {
  pagination: false,
  filtering: false,
  selecting: false,
  sorting: false,
}

class Fillter {
  options: FillterOptions = {}

  constructor(options: FillterOptions) {
    this.options = { ...defaultOptions, ...options }
  }

  getParams(params: { [name: string]: string }) {
    const { filtering, selecting, sorting, pagination } = this.options
    const result: FindManyFilter = {}

    for (const [key, val] of Object.entries(params)) {
      // sorting
      if (this.filterSorting(result, key, val, sorting)) {
        continue
      }

      // selecting
      if (this.filterSelecting(result, key, val, selecting)) {
        continue
      }

      // pagination
      if (this.filterPagination(result, key, val, pagination)) {
        continue
      }

      // filtering
      if (this.filterOther(result, key, val, filtering)) {
        continue
      }
    }

    console.log('result -> \n', result)

    return result
  }

  filterSorting(
    result: FindManyFilter,
    key: string,
    val: string,
    sorting: boolean,
  ) {
    if (sorting) {
      return false
    }

    let isContinue = false

    // sort: =name:asc,id:desc
    if (key === SORTING) {
      const arrs = val.split(',')
      for (const item of arrs) {
        const arr = item.split(':')
        if (arr.length === 2) {
          result[key] = {
            [arr[0]]: arr[1],
          }
        }
      }

      isContinue = true
    }

    return isContinue
  }

  filterSelecting(
    result: FindManyFilter,
    key: string,
    val: string,
    selecting: boolean,
  ) {
    if (selecting) {
      return false
    }

    let isContinue = false

    // selecting: use `include` or `select`, but not both at the same time
    if (SELECTING.includes(key)) {
      const tmp = {}
      const arr: string[] = [...new Set(val.split(','))]
      for (const a of arr) {
        tmp[a] = true
      }
      result[key] = tmp

      isContinue = true
    }

    return isContinue
  }

  filterPagination(
    result: FindManyFilter,
    key: string,
    val: string,
    pagination: string[][] | false,
  ) {
    if (pagination === false) {
      return false
    }

    let isContinue = false

    if (pagination[0].includes(key)) {
      // must >=0
      const num = parseInt(val)
      if (!isNaN(num) && num >= 0) {
        result[key] = num
      } else {
        throw new Error(`argument '${key}' must be a positive integer`)
      }
      isContinue = true
    } else if (pagination[1].includes(key)) {
      // cursor=id:xxxx
      const arr = val.split(':')
      result[key] = {
        [arr[0]]: +arr[1],
      }
      isContinue = true
    }

    return isContinue
  }

  // TODO: 此方法暂未验证，待开发...
  filterOther(
    result: FindManyFilter,
    key: string,
    val: string,
    filtering: boolean,
  ) {
    if (filtering) {
      return false
    }

    let isContinue = false

    // where: _equals, _not, _in, _notIn, _lt, _lte, _gt, _gte, _contains, _startsWith, _endsWith
    const arr = key.split('_')
    if (arr[0]) {
      const filter = arr[1] && FILTERING.includes(arr[1]) ? arr[1] : 'equals'
      const vals = ['in', 'notIn'].includes(filter)
        ? [...new Set(val.split(','))]
        : val

      result.where = result.where || {}
      result.where[arr[0]] = {
        [filter]: vals,
      }
    } else {
      isContinue = true
    }

    return isContinue
  }
}

export const findManyFilter = new Fillter({
  pagination: [['take', 'skip'], ['cursor']],
  filtering: true,
  selecting: true,
  sorting: true,
})

export const countFilter = new Fillter({
  pagination: [
    ['first', 'last', 'skip'],
    ['after', 'before'],
  ],
  filtering: true,
  selecting: true,
  sorting: true,
})
