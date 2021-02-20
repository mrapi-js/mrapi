const { GraphQLSchema, GraphQLObjectType } = require('graphql')

const { AnimalType, dogType, fishType } = require('./types/interfaceType')

// 规范写法，声明query(查询类型接口) 和 mutation(修改类型接口)
module.exports = new GraphQLSchema({
  types: [AnimalType, dogType, fishType],
  query: new GraphQLObjectType({
    name: 'Query',
    description: '查询数据',
    fields: () => ({
      // 查询类型接口方法名称
      fetchObjectData: require('./queries/fetchObjectData'),
      fetchArrayData: require('./queries/fetchArrayData'),
      fetchListData: require('./queries/fetchListData'),
      fetchEnumData: require('./queries/fetchEnumData'),
      fetchInputObjectData: require('./queries/fetchInputObjectData'),
      fetchUnionData: require('./queries/fetchUnionData'),
      fetchInterfaceData: require('./queries/fetchInterfaceData'),
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    description: '修改数据',
    fields: () => ({
      // 修改类型接口方法名称
      updateData: require('./mutations/updateData'),
    }),
  }),
})
