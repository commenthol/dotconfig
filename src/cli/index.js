import { readFileSync } from 'fs'
import { argv } from './argv.js'
import { commands } from './commands.js'
import { log } from '../utils.js'

export { log }

const help = `
Usage:
  dotconfig [options] [command] [args...]

Options:
  -h, --help              display help
  -V, --version           output the version number
  -f, --file <file>       path to your .env file (default .env)
  -k, --keys <file>       path to your keys file (default .env.keys)
  -s, --stdout            send output to stdout. Does not overwrite file
  --encoding <enc>        change encoding to 'enc' (default utf-8)

Commands:
  help                    display help
  version                 output the version number
  encrypt                 encrypt all env-vars
  encrypt <key>           encrypt existing environment variable
  encrypt <key> <value>   encrypt new environment variable
  decrypt                 decrypt all env-vars
  decrypt <key>           decrypt environment variable
  publickey <privatekey>  obtain public key from private key
`

/**
 * @typedef {{
 *  command?: string
 *  args: string[]|[]
 *  help?: boolean
 *  version?: boolean
 *  quiet?: boolean
 *  file: string
 *  keys: string
 *  encoding: BufferEncoding
 *  stdout?: boolean
 * }} Args
 */

export const cli = () => {
  /** @type {Args} */
  // @ts-expect-error
  const c = argv({
    command: ['help', 'version', 'encrypt', 'decrypt', 'recrypt', 'publickey'],
    shortCode: {
      '-h': 'help',
      '-V': 'version',
      '-q': '--quiet',
      '-f': 'file',
      '-k': 'keys',
      '-s': 'stdout'
    },
    types: {
      file: String,
      keys: String,
      encoding: String,
      publickey: String
    },
    def: { file: '.env', keys: '', encoding: 'utf-8' } // defaults
  })

  log(c)

  if (c.command === 'help' || c.help) {
    console.info(help)
    return
  }
  if (c.command === 'version' || c.version) {
    const { version } = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
    )
    console.info(version)
    return
  }

  const conf = commands.prepare(c)

  // apply commands
  if (c.command === 'encrypt') {
    commands.encrypt(conf, c)
    return
  }
  if (c.command === 'decrypt') {
    commands.decrypt(conf, c)
    return
  }
  // if (c.command === 'recrypt') {
  //   commands.recrypt(conf, c)
  //   return
  // }
  if (c.command === 'publickey') {
    commands.publickey(c)
    return
  }

  console.info(help)
}
