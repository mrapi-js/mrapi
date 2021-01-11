const {
  GraphQLList
} = require('graphql')

const { AnimalType } = require("../types/interfaceType")

module.exports = {
  type: new GraphQLList(AnimalType),
  description: 'interface类型数据例子',
  resolve: (root, params, context) => {
    return [
      {
        "species": "哈士奇",
        "color": "旺财"
      },
      {
        "species": "热带鱼",
        "color": "红色"
      }
    ]
  }
}


// 调用例子
// query fetchInterfaceData {
//   fetchInterfaceData {
//     species
//     ...on dog {
//       name
//     }
//     ...on fish {
//       color
//     }
//   }
// }