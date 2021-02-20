const { GraphQLString, GraphQLList, GraphQLObjectType } = require('graphql')

const textType = new GraphQLObjectType({
  name: 'textItem',
  description: 'text信息',
  fields: () => ({
    text: {
      type: GraphQLString,
      description: '内容',
    },
  }),
})

module.exports = {
  type: new GraphQLList(textType),
  description: 'list类型数据例子',
  resolve: (root, params, context) => {
    return [
      {
        text: 'hahaha',
      },
    ]
  },
}

// 调用例子
// query fetchListData {
//   fetchListData {
//     text
//   }
// }
