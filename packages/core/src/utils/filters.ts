/*
  equals
  not
  in
  notIn
  lt
  lte
  gt
  gte
  contains
  startsWith
  endsWith
*/
/*
  select
  include
*/
const filters = [
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
export const parseFilter = (params: Record<any, String>) => {
  const result = {}
  const where = {}
  let select
  let include
  for (let [key, val] of Object.entries(params)) {
    const arr = key.split('_')
    if (!arr[0]) {
      continue
    }

    if (arr[0] === 'select') {
      select = {}
      const arr = [...new Set(val.split(','))]
      for (let a of arr) {
        select[a] = true
      }
      continue
    }
    if (arr[0] === 'include') {
      include = {}
      const arr = [...new Set(val.split(','))]
      for (let a of arr) {
        include[a] = true
      }
      continue
    }

    const filter = arr[1] && filters.includes(arr[1]) ? arr[1] : 'equals'
    const vals = ['in', 'notIn'].includes(filter)
      ? [...new Set(val.split(','))]
      : val

    where[arr[0]] = {
      [filter]: vals,
    }
  }

  result['where'] = where

  // use `include` or `select`, but not both at the same time
  if (select) {
    result['select'] = select
  } else if (include) {
    result['include'] = include
  }

  return result
}
