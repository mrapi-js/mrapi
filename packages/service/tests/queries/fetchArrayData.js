const { GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql')

module.exports = {
  type: new GraphQLList(GraphQLString),
  description: 'array类型数据例子',
  args: {
    text: {
      type: new GraphQLNonNull(GraphQLString),
      description: '内容',
    },
  },
  resolve: (root, params, context) => {
    const { text } = params

    return [text]
  },
}

// 调用例子
// query fetchArrayData {
//   fetchArrayData(
//     text: "hahaha"
//   )
// }
