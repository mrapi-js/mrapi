export default (schema?: boolean) => `
#{import}

${
  schema
    ? `
export const #{Model}FindOneQuery = queryField${staticData};
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

const staticData = `('findOne#{Model}', {
  type: '#{Model}',
  nullable: true,
  args: {
    where: #{schema}arg({
      type: '#{Model}WhereUniqueInput',
      nullable: false,
    }),
    select: '#{Model}Select',
    #{includeModel}
  },
  resolve(_parent, args, { prisma }) {
    return prisma.#{model}.findOne(args) as any
  },
})`
