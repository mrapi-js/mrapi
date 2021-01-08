const {
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require('graphql')

const fileObject = new GraphQLInputObjectType({
  name: 'fileObject',
  description: "文件数据",
  fields: () => ({
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: '文件类型'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: '文件的原始文件名称'
    },
    size: {
      type: new GraphQLNonNull(GraphQLInt),
      description: '文件大小(bytes)'
    },
    path: {
      type: new GraphQLNonNull(GraphQLString),
      description: '文件上传后的路径'
    },
  }),
});

module.exports = {
  type: GraphQLBoolean,
  description: 'inputObject类型数据例子',
  args: {
    file: {
      type: fileObject,
      description: 'object类型参数'
    }
  },
  resolve: (root, params, context) => {
    return true
  }
}


// 调用例子
// query fetchInputObjectData {
//   fetchInputObjectData(
//     file: {
//       type: "hello.jpg",
//       name: "hello",
//       size: 1024,
//       path: "/img/hello.jpg"
//     }
//   )
// }
