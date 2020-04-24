export const parseArgv = (argv = process.argv.slice(2)) => {
  return {
    dir: argv[0],
    template: argv[1] ? argv[1].replace('--', '') : '',
  }
}
