const inquirer = require('inquirer')

const bench = require('./bench')
const { clean } = require('./utils')
const { choices, list } = require('./frameworks.js')

run().catch(err => {
  console.error(err)
  process.exit(1)
})

async function run () {
  const options = await getBenchmarkOptions()
  const modules = options.all ? choices : await select(list)

  // await clean()

  return bench(options, modules)
}

async function getBenchmarkOptions () {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'middlewares',
      message: 'How many middlewares do you need?',
      default: 0,
      validate (value) {
        return !Number.isNaN(parseFloat(value)) || 'Please enter a number'
      },
      filter: Number,
    },
    {
      type: 'confirm',
      name: 'all',
      message: 'Do you want to run all benchmark tests?',
      default: false,
    },
    {
      type: 'input',
      name: 'connections',
      message: 'How many connections do you need?',
      default: 100,
      validate (value) {
        return !Number.isNaN(parseFloat(value)) || 'Please enter a number'
      },
      filter: Number,
    },
    {
      type: 'input',
      name: 'pipelining',
      message: 'How many pipelines do you need?',
      default: 10,
      validate (value) {
        return !Number.isNaN(parseFloat(value)) || 'Please enter a number'
      },
      filter: Number,
    },
    {
      type: 'input',
      name: 'duration',
      message: 'How long should it take?',
      default: 10,
      validate (value) {
        return !Number.isNaN(parseFloat(value)) || 'Please enter a number'
      },
      filter: Number,
    },
  ])
}

async function select () {
  const result = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select packages',
      name: 'list',
      choices: [
        new inquirer.Separator(' = The usual ='),
        ...list(),
        new inquirer.Separator(' = The extras = '),
        ...list(true),
      ],
      validate: function (answer) {
        if (answer.length < 1) {
          return 'You must choose at least one package.'
        }
        return true
      },
    },
  ])
  return result.list
}
