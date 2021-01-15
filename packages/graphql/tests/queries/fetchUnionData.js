const {
  GraphQLString,
  GraphQLList,
  GraphQLUnionType,
  GraphQLObjectType
} = require('graphql')

const weixinType = new GraphQLObjectType({
  name: 'weixinItem',
  description: 'weixin数据',
  fields: {
    source: {
      type: GraphQLString,
      description: '来源'
    },
    title: {
      type: GraphQLString,
      description: '标题'
    }
  }
})

const weiboType = new GraphQLObjectType({
  name: 'weiboItem',
  description: 'weibo数据',
  fields: {
    source: {
      type: GraphQLString,
      description: '来源'
    },
    author: {
      type: GraphQLString,
      description: '作者'
    }
  }
})

const articleUnion = new GraphQLUnionType({
  name: 'articleUnion',
  description: '文章联合类型',
  types: [weixinType, weiboType],
  resolveType: (value) => {
    switch (value.source) {
      case 'weixin':
        return weixinType
      case 'weibo':
        return weiboType
    }
  }
})

module.exports = {
  type: new GraphQLList(articleUnion),
  description: 'union类型数据例子',
  resolve: (root, params, context) => {
    return [
      {
        "source": "weixin",
        "title": "标题 1",
      },
      {
        "source": "weibo",
        "author": "作者 1"
      }
    ]
  }
}


// 调用例子
// query fetchUnionData {
//   fetchUnionData {
//     ...on weiboItem {
//       source
//       author
//     }
//     ...on weixinItem {
//       source
//       title
//     }
//   }
// }