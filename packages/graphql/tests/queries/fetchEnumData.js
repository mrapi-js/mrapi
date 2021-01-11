const {
  GraphQLString,
  GraphQLEnumType
} = require('graphql')

const sourceEnumType = new GraphQLEnumType({
  name: 'sourceEnum',
  description: '文章来源枚举类型',
  values: {
    weixin: {
      value: 'weixin',
      description: '微信'
    },
    weibo: {
      value: 'weibo',
      description: '微博'
    }
  }
})

module.exports = {
  type: GraphQLString,
  description: 'enum类型数据例子',
  args: {
    source: {
      type: sourceEnumType,
      description: '文章来源类型',
      defaultValue: 'weixin'
    }
  },
  resolve: (root, params, context) => {
    let { source } = params

    return source
  }
}


// 调用例子
// query fetchEnumData {
//   fetchEnumData(
//     source: weixin
//   )
// }