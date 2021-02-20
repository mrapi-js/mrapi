const {
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql')

const userType = new GraphQLObjectType({
  name: 'userItem',
  description: '用户信息',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: '数据唯一标识',
    },
    username: {
      type: GraphQLString,
      description: '用户名',
    },
    age: {
      type: GraphQLInt,
      description: '年龄',
    },
    height: {
      type: GraphQLFloat,
      description: '身高',
    },
    isMarried: {
      type: GraphQLBoolean,
      description: '是否已婚',
      deprecationReason: '这个字段现在不需要了',
    },
  }),
})

module.exports = {
  type: userType,
  description: 'object类型数据例子',
  args: {
    isReturn: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: '是否返回数据',
    },
  },
  resolve: (root, params, context) => {
    const { isReturn } = params
    if (isReturn) {
      return {
        id: '5bce2b8c7fde05hytsdsc12c',
        username: 'Davis',
        age: 23,
        height: 190.5,
        isMarried: true,
      }
    } else {
      return null
    }
  },
}

// 调用例子
// query fetchObjectData {
//   fetchObjectData(
//     isReturn: true
//   ) {
//     id
//     username
//     age
//     height
//     isMarried
//   }
// }
