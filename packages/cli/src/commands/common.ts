import chalk from 'chalk'
import commander from 'commander'

interface CommandOptions {
  key: string
  required: true
  flags: string[]
}

export interface CommandParams {
  description: string
  options: CommandOptions[]
}

export default class Command {
  name: string
  runner: any
  argv: any

  private readonly program: commander.Command

  constructor(program: commander.Command, params: CommandParams) {
    this.name = this.constructor.name.replace(/Command$/, '').toLowerCase()

    // make command
    let programCommand = program
      .command(this.name)
      .description(params.description)
    params.options.forEach((option) => {
      programCommand = programCommand[
        option.required ? 'requiredOption' : 'option'
      ](...option.flags)
    })
    this.program = programCommand

    // runner
    const runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain
        .then(() => this.initialize())
        // If initialize return false, stop...
        .then((proceed: any) => {
          if (proceed !== false) {
            return this.execute()
          }
        })
      chain.then(
        (result: any) => {
          console.log(
            chalk.green(`Generated "${this.argv.schema}" successful.`),
          )
          resolve(result)
        },
        (err) => {
          console.log(err)
          reject(err)
        },
      )
    })

    Object.defineProperty(this, 'runner', {
      value: runner,
    })
  }

  then(onResolved: Function, onRejected?: Function) {
    return this.runner.then(onResolved, onRejected)
  }

  catch(onRejected: Function) {
    return this.runner.catch(onRejected)
  }

  initialize(): boolean {
    this.argv = this.program.opts()
    return true
  }

  execute() {
    throw new Error(`${this.name} execute() needs to be implemented.`)
  }
}
