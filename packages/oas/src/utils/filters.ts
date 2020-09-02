/**
 * Reference documentation
 *
 * https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud

// findOne FindOneUserArgs
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// findMany FindManyUserArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  cursor?: UserWhereUniqueInput | null
  take?: number | null
  skip?: number | null
}

// create UserCreateArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  data: UserCreateInput
}

// delete FindOneUserArgs
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// update UserUpdateArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  data: UserUpdateInput
  where: UserWhereUniqueInput
}

// deleteMany
{
  where: UserWhereUniqueInput
}

// updateMany UserUpdateManyArgs
{
  data: UserUpdateManyMutationInput
  where?: UserWhereInput | null
}

// count FindManyUserArgs
{
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  skip?: number | null
  after?: UserWhereUniqueInput | null
  before?: UserWhereUniqueInput | null
  first?: number | null
  last?: number | null
}

// upsert UserUpsertArgs
{
  select?: UserSelect | null
  include?: UserInclude | null
  where: UserWhereUniqueInput
  create: UserCreateInput
  update: UserUpdateInput
}

// aggregate AggregateUserArgs
{
  where?: UserWhereInput
  orderBy?: Enumerable<UserOrderByInput>
  cursor?: UserWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Enumerable<UserDistinctFieldEnum>
  count?: true
  avg?: UserAvgAggregateInputType
  sum?: UserSumAggregateInputType
  min?: UserMinAggregateInputType
  max?: UserMaxAggregateInputType
}

 *
 */
const SELECTING = ['select', 'include']
const SORTING = 'orderBy'
const FILTERING = [
  'equals',
  'not',
  'in',
  'notIn',
  'lt',
  'lte',
  'gt',
  'gte',
  'contains',
  'startsWith',
  'endsWith',
]

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
  result: FindManyFilter = {}
  options: FillterOptions = {}

  constructor(
    params: {
      [name: string]: string
    },
    options: FillterOptions,
  ) {
    this.options = { ...defaultOptions, ...options }

    for (const [key, val] of Object.entries(params)) {
      // sorting
      if (this.filterSorting(key, val)) {
        continue
      }

      // selecting
      if (this.filterSelecting(key, val)) {
        continue
      }

      // pagination
      if (this.filterPagination(key, val)) {
        continue
      }

      if (this.filterOther(key, val)) {
        continue
      }
    }
  }

  filterSorting(key: string, val: string) {
    const { sorting } = this.options
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
          this.result[key] = {
            [arr[0]]: arr[1],
          }
        }
      }

      isContinue = true
    }

    return isContinue
  }

  filterSelecting(key: string, val: string) {
    const { selecting } = this.options
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
      this.result[key] = tmp

      isContinue = true
    }

    return isContinue
  }

  filterPagination(key: string, val: string) {
    const { pagination } = this.options
    if (pagination === false) {
      return false
    }

    let isContinue = false

    if (pagination[0].includes(key)) {
      // must >=0
      const num = parseInt(val)
      if (!isNaN(num) && num >= 0) {
        this.result[key] = num
      } else {
        throw new Error(`argument '${key}' must be a positive integer`)
      }
      isContinue = true
    } else if (pagination[1].includes(key)) {
      // cursor=id:xxxx
      const arr = val.split(':')
      this.result[key] = {
        [arr[0]]: +arr[1],
      }
      isContinue = true
    }

    return isContinue
  }

  // TODO: 此方法暂未验证，待开发...
  filterOther(key: string, val: string) {
    const { filtering } = this.options
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

      this.result.where = this.result.where || {}
      this.result.where[arr[0]] = {
        [filter]: vals,
      }
    } else {
      isContinue = true
    }

    return isContinue
  }
}

export const findManyFilter = (params: Record<any, string>): FindManyFilter => {
  const { result } = new Fillter(params, {
    pagination: [['take', 'skip'], ['cursor']],
    filtering: true,
    selecting: true,
    sorting: true,
  })
  console.log('findManyFilter:', result)
  return result
}

export const countFilter = (params: Record<any, string>): CountFilter => {
  const { result } = new Fillter(params, {
    pagination: [
      ['first', 'last', 'skip'],
      ['after', 'before'],
    ],
    filtering: true,
    selecting: true,
    sorting: true,
  })
  console.log('countFilter:', result)
  return result
}
