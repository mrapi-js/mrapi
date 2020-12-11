const chalk = require('chalk')
const { readdir } = require('fs').promises

const orderBy = (arr, props, orders) =>
  [...arr].sort((a, b) =>
    props.reduce((acc, prop, i) => {
      if (acc === 0) {
        const [p1, p2] =
          orders && orders[i] === 'desc'
            ? [b[prop], a[prop]]
            : [a[prop], b[prop]]
        acc = p1 > p2 ? 1 : p1 < p2 ? -1 : 0
      }
      return acc
    }, 0),
  )

async function run () {
  const files = await readdir('./results')

  const results = files
    .map(file => require(`./results/${file}`))
    .map(item => {
      const name = Object.keys(item)[0]
      return {
        name,
        ...item[name],
      }
    })

  const key = 'all together'
  const ordered = orderBy(results, [key], ['desc'])

  console.log(`${'Name'.padEnd(20)} ${key}`),
    ordered.forEach(item =>
      console.log(
        `${chalk.cyan(item.name.padEnd(20))} ${item[key].toLocaleString()}`,
      ),
    )
}

run()
