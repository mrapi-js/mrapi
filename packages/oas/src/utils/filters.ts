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

  getParams(params: { [name: string]: any } = {}) {
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

    return result
  }

  filterSorting(
    result: FindManyFilter,
    key: string,
    val: string[],
    sorting: boolean,
  ) {
    if (!sorting) {
      return false
    }

    let isContinue = false

    // sort: =name:asc,id:desc
    if (key === 'orderBy') {
      if (Array.isArray(val)) {
        for (const item of val) {
          const arr = item.split(':')
          if (arr.length === 2) {
            result[key] = {
              [arr[0]]: arr[1],
            }
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
    val: string[],
    selecting: boolean,
  ) {
    if (!selecting) {
      return false
    }

    let isContinue = false

    // TODO: 待开发中 -> Post: FindManyPostArgs ?
    // selecting: use `include` or `select`, but not both at the same time.
    if (['select', 'include'].includes(key)) {
      const tmp = {}
      if (Array.isArray(val)) {
        for (const a of val) {
          tmp[a] = true
        }
        result[key] = tmp
      }

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
      if (val.length === 2) {
        result[key] = {
          [arr[0]]: +arr[1],
        }
      }

      isContinue = true
    }

    return isContinue
  }

  filterOther(
    result: FindManyFilter,
    key: string,
    val: string,
    filtering: boolean,
  ) {
    if (!filtering) {
      return false
    }

    let isContinue = false

    if (key === 'where') {
      const obj = JSON.parse(val)
      if (obj) {
        result.where = obj
      }

      isContinue = true
    }

    return isContinue
  }
}

// export const findOne = new Fillter({
//   filtering: true,
//   selecting: true,
// })

export const findManyFilter = new Fillter({
  pagination: [['take', 'skip'], ['cursor']],
  filtering: true,
  selecting: true,
  sorting: true,
})

// export const countFilter = new Fillter({
//   pagination: [
//     ['first', 'last', 'skip'],
//     ['after', 'before'],
//   ],
//   filtering: true,
//   selecting: true,
//   sorting: true,
// })

// export const createFilter = new Fillter({
//   selecting: true,
// })
