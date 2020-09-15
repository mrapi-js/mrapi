import path from 'path'
import commander from 'commander'

import type { MrapiConfig } from '@mrapi/common'

interface CommandOptions {
  key: string
  required?: boolean
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
  mrapiConfig: MrapiConfig

  static params: CommandParams

  private readonly program: commander.Command

  constructor(program: commander.Command, mrapiConfig: MrapiConfig) {
    this.mrapiConfig = mrapiConfig

    this.name = this.constructor.name.replace(/Command$/, '').toLowerCase()

    // Create command
    const thisConstructor: any = this.constructor // TODO: fix tslint
    const params: CommandParams = thisConstructor.params
    let programCommand = program
      .command(this.name)
      .description(params.description)
      .option('--env <path>', 'env filePath', this.mrapiConfig.envPath)
    params.options.forEach((option) => {
      programCommand = programCommand[
        option.required ? 'requiredOption' : 'option'
      ](option.flags[0], option.flags[1], option.flags[2]) // ...option.flags
    })
    this.program = programCommand

    // Runner
    const runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain
        .then(async () => {
          const next = await this.initialize()
          return next
        })
        // If initialize return false, stop...
        .then(async (proceed: any) => {
          if (proceed !== false) {
            const next = await this.execute()
            return next
          }
        })
      chain.then(
        (result: any) => {
          // console.log(
          //   chalk.green(
          //     `✅ Mrapi run ${this.name} successful.`,
          //   ),
          // )
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

    // Loading env file
    require('dotenv').config({
      path: path.resolve(process.cwd(), this.argv.env || '.env'),
    })

    // debug
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${this.name} argv =`, this.argv, '\n')
      // console.log('\nprocess.env:', process.env, '\n')
    }
    return true
  }

  execute() {
    throw new Error(`${this.name} execute() needs to be implemented.`)
  }
}
