const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInterfaceType,
} = require('graphql')

const AnimalType = new GraphQLInterfaceType({
  name: 'Animal',
  description: 'Animal接口',
  fields: {
    species: {
      type: GraphQLString,
      description: '动物物种',
    },
  },
})

const dogType = new GraphQLObjectType({
  name: 'dog',
  interfaces: [AnimalType],
  description: 'dog数据',
  fields: {
    species: {
      type: GraphQLString,
      description: '动物物种',
    },
    name: {
      type: GraphQLString,
      description: '名称',
    },
  },
  isTypeOf: (obj) => obj.varietie,
})

const fishType = new GraphQLObjectType({
  name: 'fish',
  interfaces: [AnimalType],
  description: 'fish数据',
  fields: {
    species: {
      type: GraphQLString,
      description: '动物物种',
    },
    color: {
      type: GraphQLString,
      description: '颜色',
    },
  },
  isTypeOf: (obj) => obj.color,
})

module.exports = {
  AnimalType: AnimalType,
  dogType: dogType,
  fishType: fishType,
}
