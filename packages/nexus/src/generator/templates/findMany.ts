export default (schema?: boolean) => `
#{import}

${
  schema
    ? `
export const #{Model}FindManyQuery = queryField${staticData};
`
    : `
schema.extendType({
  type: 'Query',
  definition(t) {
    t.field${staticData};
  },
});
`
}
`

const staticData = `('findMany#{Model}', {
  type: '#{Model}',
  nullable: true,
  list: true,
  args: {
    where: '#{Model}WhereInput',
    orderBy: #{schema}arg({ type: '#{Model}OrderByInput', list: true }),
    cursor: '#{Model}WhereUniqueInput',
    skip: 'Int',
    take: 'Int',
    select: '#{Model}Select',
    #{includeModel}
  },
  resolve(_parent, args, {prisma}) {
    return prisma.#{model}.findMany(args) as any
  },
})`
