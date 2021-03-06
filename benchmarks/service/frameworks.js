const { devDependencies: dependencies } = require('./package')

const packages = {
  'service-graphql': {
    hasRouter: true,
    package: '@mrapi/service',
    checked: true,
  },
  'service-graphql-prisma': {
    hasRouter: true,
    package: '@mrapi/service',
    checked: true,
  },
  'service-graphql-prisma-mysql': {
    hasRouter: true,
    package: '@mrapi/service',
    checked: true,
  },
}

let choices = []
Object.keys(packages).forEach(pkg => {
  if (!packages[pkg].version) {
    const module = dependencies[pkg] ? pkg : packages[pkg].package
    const modulePath = module && require.resolve(module + '/package.json')
    if (!modulePath) {
      console.log(`module ${JSON.stringify(pkg)} not found`)
      process.exit()
    }
    const version = require(modulePath).version
    packages[pkg].version = version
  }

  choices.push(pkg)
})

module.exports = {
  choices: choices.sort(),

  list: (extra = false) => {
    return choices
      .map(c => {
        return extra === !!packages[c].extra
          ? Object.assign({}, packages[c], { name: c })
          : null
      })
      .filter(c => c)
  },

  info: module => {
    return packages[module]
  },
}
