export default {
  name: 'generate',
  description: 'Generate prisma schema and nexus types',
  options: [
    ['--names <names...>', 'DAL service names and "management".'],
    [
      '--cnt <options>',
      // `Generate CNT params. whiteList: ${cntWhiteList.join(',')}`,
    ],
    ['--m <options>', 'Generate models'],
    ['--em <options>', 'Exclude generate models'],
    ['--eqm <options>', 'Exclude Queries and Mutations'],
    [
      '--provider <options>',
      // `Datasource provider list: ${datasourceProvider.join(',')}.`,
    ],
  ],
  async fn(args: any, opts: any, execute: Function) {
    const { names, provider, cnt, m, em, eqm } = opts

    for (const name of names) {
      await execute({
        name,
        provider,
        options: { cnt, m, em, eqm },
      })
    }
  },
}
