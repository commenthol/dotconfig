import { readFileSync } from 'fs'
import {
  log,
  toBoolean,
  resolveFilename,
  resolveFilenamePrivateKeys
} from './utils.js'
import { getPrivateKeys, getFirstPublicKey } from './crypt.js'

export const DOTENV_PRIVATE_KEYS_PATH = 'DOTENV_PRIVATE_KEYS_PATH'

/**
 * @typedef {object} DotenvConfigOptions
 * @property {string|URL} [options.path] The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
 * @property {BufferEncoding} [options.encoding='utf-8'] The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
 * @property {boolean} [options.override=false] Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
 * @property {NodeJS.ProcessEnv|object} [options.processEnv] The process environment object to update. Default is `process.env`.
 */

/**
 * @typedef {{
 *  parsed: Record<string,string|number|boolean>|{}
 *  privateKeys?: string[]
 *  tokens?: Token[]
 *  tokensKeys?: Token[]
 * }} ConfigResult
 * - parsed: key-value pairs of parsed .env file
 * - privateKeys: list of private keys found in keys file
 * - tokens: (used by cli) tokenized lines of .env file
 * - tokensKeys: (used by cli) tokenized lines of .env.keys file
 */

/**
 * Reads and parses a dotenv file and updates the process environment variables.
 *
 * @param {DotenvConfigOptions} [options] Optional parameters for configuring the dotenv file.
 * @return {ConfigResult} An object containing the parsed dotenv file data.
 */
export function config(options = {}) {
  let { path: _path, encoding, override, processEnv } = options || {}

  const { DOTENV_CONFIG_ENCODING, DOTENV_CONFIG_PATH, DOTENV_CONFIG_OVERRIDE } =
    process.env

  const path = resolveFilename(DOTENV_CONFIG_PATH || (!_path ? '.env' : _path))
  encoding = /** @type {BufferEncoding} */ (
    DOTENV_CONFIG_ENCODING || encoding || 'utf-8'
  )
  override = toBoolean(DOTENV_CONFIG_OVERRIDE) || override || false
  processEnv =
    processEnv && typeof processEnv === 'object' ? processEnv : process.env

  const { env: parsed = {}, tokens } = parseDotenvFile(path, { encoding })

  for (const [key, value] of Object.entries(parsed)) {
    if (override || processEnv[key] === undefined) {
      processEnv[key] = value
    }
  }

  let privateKeys
  let tokensKeys

  if (getFirstPublicKey(processEnv)) {
    const privateKeyFilename = resolveFilenamePrivateKeys(
      path,
      parsed[DOTENV_PRIVATE_KEYS_PATH] ||
        process.env[DOTENV_PRIVATE_KEYS_PATH] ||
        processEnv[DOTENV_PRIVATE_KEYS_PATH]
    )

    Reflect.deleteProperty(process.env, DOTENV_PRIVATE_KEYS_PATH)
    Reflect.deleteProperty(processEnv, DOTENV_PRIVATE_KEYS_PATH)
    Reflect.deleteProperty(parsed, DOTENV_PRIVATE_KEYS_PATH)

    const { env: parsedKeyEnvVars, tokens } = parseDotenvFile(
      privateKeyFilename,
      { encoding: 'utf-8' }
    )
    if (!parsedKeyEnvVars) {
      throw new Error('No private keys for DOTENV_PUBLIC_KEY* found')
    }
    tokensKeys = tokens
    privateKeys = getPrivateKeys(parsedKeyEnvVars)
  }

  return { parsed, privateKeys, tokens, tokensKeys }
}

/**
 * @param {string} path
 * @param {{ encoding?: BufferEncoding }} [options]
 * @returns {{env?: Record<string,string>, tokens?: Token[]}}
 */
export function parseDotenvFile(path, options) {
  const { encoding } = options || {}
  try {
    const content = readFileSync(path, { encoding })
    return parse(content.toString())
  } catch (/** @type {Error|any} */ err) {
    log(`ERROR: Failed to load ${path} with ${err.message}`)
  }
  return {}
}

/**
 * @typedef {{
 *  line?: string
 *  key?: string
 *  value?: string
 *  quoteChar?: string
 *  comment?: string
 * }} Token
 * - line: original or concated line(s)
 * - key: found key on that line (or multiline)
 * - value: value of key
 * - quoteChar: quote character of value
 * - comment: comment on same line as key-value
 */

/**
 * Parses the content and extracts key-value pairs into an object.
 *
 * @param {string} content The content to parse.
 * @return {{
 *  env: Record<string,string>|{}
 *  tokens: Token[]
 * }} An object containing the extracted key-value pairs.
 */
export function parse(content) {
  const env = {}

  let cache = {}
  const tokens = []

  const lines = content.split('\n')
  let i = 0
  for (const line of lines) {
    i++
    const trimmedLine = line.replace(/^export\s+/, '').trim()
    const token = { line }

    if (!cache.lines && (!trimmedLine || trimmedLine.startsWith('#'))) {
      tokens.push(token)
      continue
    }

    if (!cache.lines && trimmedLine.includes('=')) {
      const [_key] = trimmedLine.split('=')
      const key = (cache.key = _key.trim())
      const _value = trimmedLine.slice(key.length + 1)
      const output = replaceQuotes(_value.trim())
      const value = output.value
      const comment = output.comment
      const quoteChar = output.quoteChar
      env[key] = value

      if (output.isMultiline) {
        cache = { lines: [line], key, value, quoteChar, comment }
      } else {
        tokens.push({ line, key, value, comment, quoteChar })
        // @ts-expect-error
        cache = {}
      }
      /* c8 ignore next 3 */
    } else if (!cache.lines) {
      log(`ERROR: Parsing line %s`, i)
    } else {
      cache.lines.push(line)
      const output = replaceQuotes(line, cache.quoteChar)
      cache.value += '\n' + output.value
      env[cache.key] = cache.value
      cache.comment = output.comment
      cache.quoteChar = output.quoteChar

      if (!output.isMultiline) {
        const { lines, ...other } = cache
        tokens.push({ line: lines.join('\n'), ...other })
        // @ts-expect-error
        cache = {}
      }
    }
  }
  if (cache.key) {
    const { lines, ...other } = cache
    tokens.push({ line: lines.join('\n'), ...other })
  }

  return { env, tokens }
}

const QUOTES = /['"`]/

const firstCharQuote = (value = '') =>
  QUOTES.test(value[0]) ? value[0] : undefined

const replaceQuotes = (input, quote) => {
  const quoteChar = quote || firstCharQuote(input)
  if (!quoteChar) {
    return { value: input }
  }
  let value = ''
  let comment = ''
  const flags = { i: -1 }

  const chars = [...input]
  for (let c of chars) {
    flags.i++
    if (c === '\\' && chars[flags.i + 1] === quoteChar) {
      flags.esc = true
      continue
    }
    if (c === quoteChar) {
      if (flags.esc) {
        value += c
      } else if (flags.i !== 0) {
        flags.end = true
      }
      flags.esc = false
      continue
    }
    if (!flags.end) {
      value += c
    } else {
      comment += c
    }
    flags.esc = false
  }
  let isMultiline = !flags.end
  if (isMultiline && !value && input[0] === quoteChar) {
    isMultiline = false
  }
  return { value, comment, quoteChar, isMultiline }
}
