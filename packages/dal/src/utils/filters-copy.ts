/**
 * Reference documentation
 *
 * https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud

// findOne
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// findMany
{
  select?: UserSelect | null
  include?: UserInclude | null
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  cursor?: UserWhereUniqueInput | null
  take?: number | null
  skip?: number | null
}

// create
{
  select?: UserSelect | null
  include?: UserInclude | null
  data: UserCreateInput
}

// delete
{
  where: UserWhereUniqueInput
  select?: UserSelect | null
  include?: UserInclude | null
}

// update
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

// updateMany
{
  data: UserUpdateManyMutationInput
  where?: UserWhereInput | null
}

// count
{
  where?: UserWhereInput | null
  orderBy?: Enumerable<UserOrderByInput> | null
  skip?: number | null
  after?: UserWhereUniqueInput | null
  before?: UserWhereUniqueInput | null
  first?: number | null
  last?: number | null
}

 *
 */
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
const SELECTING = ['select', 'include']
const SORTING = 'orderBy'
const PAGINATION = [
  ['take', 'skip', 'first', 'last'],
  ['cursor', 'before', 'after'],
]

export const parseFilter = (
  params: Record<any, string>,
  { filtering = false, selecting = false, sorting = false, pagination = false },
): {
  where?: {}
  select?: {}
  include?: {}
  orderBy?: {}
  skip?: {}
  after?: {}
  before?: {}
  first?: {}
  last?: {}
} => {
  const result: any = {}

  for (const [key, val] of Object.entries(params)) {
    // sort: =name:asc  =name:desc
    if (sorting && key === SORTING) {
      const arr = val.split(':')
      if (arr.length === 2) {
        result[key] = {
          [arr[0]]: arr[1],
        }
      }
      continue
    }

    // selecting: use `include` or `select`, but not both at the same time
    if (selecting && SELECTING.includes(key)) {
      const tmp = {}
      const arr = [...new Set(val.split(','))]
      for (const a of arr) {
        tmp[a] = true
      }
      result[key] = tmp
      continue
    }

    // pagination
    if (pagination) {
      if (PAGINATION[0].includes(key)) {
        // must >=0
        const num = parseInt(val)
        if (!isNaN(num) && num >= 0) {
          result[key] = num
        } else {
          throw new Error(`argument '${key}' must be a positive integer`)
        }
        continue
      } else if (PAGINATION[1].includes(key)) {
        // cursor=id:xxxx
        const arr = val.split(':')
        result[key] = {
          [arr[0]]: +arr[1],
        }
        continue
      }
    }

    // where: _equals, _not, _in, _notIn, _lt, _lte, _gt, _gte, _contains, _startsWith, _endsWith
    if (filtering) {
      const arr = key.split('_')
      if (!arr[0]) {
        continue
      }

      const filter = arr[1] && FILTERING.includes(arr[1]) ? arr[1] : 'equals'
      const vals = ['in', 'notIn'].includes(filter)
        ? [...new Set(val.split(','))]
        : val

      result.where = result.where || {}
      result.where[arr[0]] = {
        [filter]: vals,
      }
    }
  }

  return result
}
