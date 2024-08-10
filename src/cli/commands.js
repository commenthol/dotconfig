import { writeFileSync } from 'fs'
import * as path from 'path'
import { resolveFilename, resolveFilenamePrivateKeys } from '../utils.js'
import { config, parseDotenvFile } from '../dotenv.js'
import {
  encryptValue,
  decryptValue,
  keyPair,
  getFirstPublicKey,
  PREFIX
} from '../crypt.js'

/** @typedef {import('../dotenv.js').ConfigResult} ConfigResult */
/** @typedef {import('../dotenv.js').Token} Token */
/** @typedef {import('./index.js').Args} Args */

export const commands = {}

/**
 * @param {Args} flags
 */
commands.prepare = (flags) => {
  // overwrite any env vars
  process.env.DOTENV_CONFIG_ENCODING = flags.encoding || 'utf-8'
  process.env.DOTENV_CONFIG_PATH = flags.file
  process.env.DOTENV_PRIVATE_KEYS_PATH = flags.keys =
    resolveFilenamePrivateKeys(flags.file, flags.keys)

  // parse the dotenv file
  /** @type {import('../dotenv.js').ConfigResult & {parsed: {DOTENV_PRIVATE_KEYS_PATH?: string}}} */
  const conf = config({})
  // keys file is attributed in .env file
  if (conf.parsed.DOTENV_PRIVATE_KEYS_PATH) {
    flags.keys = conf.parsed.DOTENV_PRIVATE_KEYS_PATH
  }

  return conf
}

/**
 * @param {ConfigResult} conf
 * @param {Args} flags
 */
commands.decrypt = (conf, flags) => {
  let { parsed, privateKeys, tokens } = conf
  const { encoding, stdout, file, quiet, args } = flags

  let singleKey

  if (args.length) {
    // decrypt <key>
    const [key] = args
    const value = parsed[key]
    if (value === undefined) {
      // silently fail
      return
    }
    singleKey = key
    parsed = { [key]: value }
  }
  const records = decryptValues(parsed, privateKeys)
  const output = printDotFile(tokens, records)

  if (stdout && singleKey) {
    process.stdout.write(records[singleKey])
  } else if (stdout) {
    process.stdout.write(output)
  } else if (file) {
    const filename = resolveFilename(file)
    writeFileSync(filename, output, { encoding })
    if (quiet) {
      return
    }
    if (singleKey) {
      console.info(`✔︎ value of key "${singleKey}" decrypted (${file})`)
    } else {
      console.info(`✔︎ decrypted (${file})`)
    }
  }
}

/**
 * @param {ConfigResult} conf
 * @param {Args} flags
 */
commands.encrypt = (conf, flags) => {
  const { file, keys, encoding, quiet, args } = flags
  let { parsed, tokens } = conf

  let publicKey = getFirstPublicKey(parsed)?.value

  if (!publicKey) {
    // no public key is found in .env file so let's generate a keypair then and
    // add it to both .env and .env.keys

    const { tokens: tokensKeys } = parseDotenvFile(keys)

    // @ts-expect-error
    const result = createNewKeys({ ...conf, tokensKeys, file })
    tokens = result.tokens
    publicKey = result.publicKey
    const output = printDotFile(result.tokensKeys)
    writeFileSync(keys, output, 'utf-8')
  }

  let singleKey
  if (args?.length === 2) {
    // encrypt new or existing key
    const [key, value] = args
    parsed = { [key]: value }
    singleKey = key
  } else if (args?.length === 1) {
    // encrypt existing key
    const [key] = args
    const value = parsed[key]
    if (value === undefined) {
      // silently fail
      return
    }
    parsed = { [key]: value }
    singleKey = key
  }

  updateKeys(publicKey, tokens, parsed)
  const output = printDotFile(tokens)
  writeFileSync(file, output, { encoding })
  if (quiet) {
    return
  }
  if (singleKey) {
    console.info(`✔︎ value of key "${singleKey}" encrypted (${file})`)
  } else {
    console.info(`✔︎ encrypted (${file})`)
  }
}

/**
 * @param {Args} flags
 */
commands.publickey = (flags) => {
  const {
    args: [privateKey]
  } = flags
  const kp = keyPair(privateKey)
  console.info(kp.publicKey)
}

/**
 * @param {Record<string,string>|{}} parsed
 * @param {string[]} privateKeys
 * @returns {Record<string,string>|{}}
 */
export const decryptValues = (parsed = {}, privateKeys = []) => {
  const records = {}
  for (const [key, val] of Object.entries(parsed)) {
    if (!val.startsWith(PREFIX)) {
      continue
    }
    const value = decryptValue(key, val, privateKeys)
    records[key] = value
  }
  return records
}

const EXPORT = 'export '

/**
 * @param {Token[]} tokens
 * @param {Record<string,string>|{}} records
 * @returns
 */
export const printDotFile = (tokens = [], records = {}) => {
  const lines = []
  for (const token of tokens) {
    const { line, quoteChar, key, value, comment = '' } = token
    if (key && value) {
      const hasExport = line?.trim().startsWith(EXPORT)
      const decValue = records[key] || value
      const qValue = quoteAndEscValue(quoteChar, decValue)
      const decLine = `${hasExport ? EXPORT : ''}${key}=${qValue}${comment}`
      lines.push(decLine)
    } else {
      lines.push(line)
    }
  }
  return lines.join('\n')
}

/**
 * @param {string} quoteChar
 * @param {string} value
 * @returns {string}
 */
export const quoteAndEscValue = (quoteChar = '', value) => {
  if (!/["'`]/.test(quoteChar)) {
    return value
  }
  const qValue = [
    quoteChar,
    value.replaceAll(quoteChar, '\\' + quoteChar),
    quoteChar
  ].join('')
  return qValue
}

/**
 * @param {string} file
 * @returns {string}
 */
export const postfixFromFilename = (file) => {
  const uppercase = (str) => str.toUpperCase()

  let base = path.basename(file)
  if (!base.startsWith('.env')) {
    base = '.env' + base.replace(/^[.]/, '-')
  }
  base = base.slice(4)
  if (!base) {
    return ''
  } else if (base[0] === '.') {
    return '_' + uppercase(base.slice(1))
  } else {
    return '_DEVELOPMENT' + uppercase(base)
  }
}

const templPublic = `
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key encryption for .env files          /
#/----------------------------------------------------------/`.replace('\n', '')

const templPrivate = `
#/------------------!DOTENV_PRIVATE_KEYS!-------------------/
#/ private decryption keys. DO NOT commit to source control /
#/----------------------------------------------------------/`.replace('\n', '')

/**
 * @param {{ file: string, privateKey: string, tokens: Token[], tokensKeys:Token[] }} param
 * @returns {{ publicKey: string, tokens: Token[], tokensKeys:Token[] }}
 */
export const createNewKeys = (param) => {
  const { file, tokens = [], tokensKeys = [], privateKey } = param
  const kp = keyPair(privateKey)
  const postfix = postfixFromFilename(file)

  // add public key
  const _tokens = [
    { line: templPublic },
    { key: `DOTENV_PUBLIC_KEY${postfix}`, value: kp.publicKey },
    { line: '' },
    ...tokens
  ]
  // add or append private key
  const key = `DOTENV_PRIVATE_KEY${postfix}`
  let found = false
  for (const token of tokensKeys) {
    if (token.key && token.key === key && token.value) {
      const keys = token.value.split(',')
      keys.push(kp.privateKey)
      token.value = keys.join(',')
      found = true
      break
    }
  }
  if (!found) {
    if (tokensKeys.length) {
      tokensKeys.push({ line: '' })
    }
    tokensKeys.push(
      { line: templPrivate },
      { line: `# ${file}` },
      { key: `DOTENV_PRIVATE_KEY${postfix}`, value: kp.privateKey },
      { line: '' }
    )
  }

  return { publicKey: kp.publicKey, tokens: _tokens, tokensKeys }
}

/**
 * @param {Token[]} tokens
 * @param {Record<string,string>|{}} records
 */
export const updateKeys = (publicKey, tokens = [], records = {}) => {
  const updated = {}
  for (const token of tokens) {
    const { key } = token
    if (key === undefined || records[key] === undefined) {
      continue
    }
    if (key.startsWith('DOTENV_') || records[key].startsWith(PREFIX)) {
      updated[key] = true
      continue
    }
    updated[key] = true
    token.value = encryptValue(records[key], publicKey)
  }
  for (const [key, _value] of Object.entries(records)) {
    if (updated[key]) continue
    const value = encryptValue(_value, publicKey)
    // remove last empty line
    if (tokens[tokens.length - 1].line === '') {
      tokens.pop()
    }
    tokens.push({ key, value, quoteChar: '"' }, { line: '' })
  }
}
