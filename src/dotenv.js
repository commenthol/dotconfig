import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { log, toBoolean, resolveFilename } from './utils.js'
import { getPrivateKeys, hasPublicKey } from './crypt.js'

const QUOTES = /['"`]/

/**
 * @typedef {object} DotenvConfigOptions
 * @property {string|URL} [options.path] The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
 * @property {BufferEncoding} [options.encoding='utf-8'] The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
 * @property {boolean} [options.override=false] Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
 * @property {NodeJS.ProcessEnv|object} [options.processEnv] The process environment object to update. Default is `process.env`.
 */

/**
 * Reads and parses a dotenv file and updates the process environment variables.
 *
 * @param {DotenvConfigOptions} [options] Optional parameters for configuring the dotenv file.
 * @return {object|undefined} An object containing the parsed dotenv file data.
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

  const parsed = parseDotenvFile(path, { encoding }) || {}

  for (const [key, value] of Object.entries(parsed)) {
    if (override || processEnv[key] === undefined) {
      processEnv[key] = value
    }
  }

  let privateKeys

  if (hasPublicKey(processEnv)) {
    const privateKeyFilename = resolveFilename(
      process.env.DOTENV_PRIVATE_KEYS_PATH ||
        processEnv.DOTENV_PRIVATE_KEYS_PATH ||
        // dotenvx default vault
        resolve(dirname(path), '.env.keys')
    )

    Reflect.deleteProperty(process.env, 'DOTENV_PRIVATE_KEYS_PATH')

    const parsedKeyEnvVars = parseDotenvFile(privateKeyFilename, { encoding })
    if (!parsedKeyEnvVars) {
      throw new Error('No private keys for DOTENV_PUBLIC_KEY* found')
    }
    privateKeys = getPrivateKeys(parsedKeyEnvVars)
  }

  return { parsed, privateKeys }
}

/**
 * @param {string} path
 * @param {{ encoding?: BufferEncoding }} [options]
 * @returns {Record<string,string>|undefined}
 */
export function parseDotenvFile(path, options) {
  const { encoding } = options || {}
  try {
    const content = readFileSync(path, { encoding })
    return parse(content.toString())
  } catch (/** @type {Error|any} */ err) {
    log(`ERROR: Failed to load ${path} with ${err.message}`)
  }
}

/**
 * Parses the content and extracts key-value pairs into an object.
 *
 * @param {string} content The content to parse.
 * @return {object} An object containing the extracted key-value pairs.
 */
export function parse(content) {
  const env = {}

  let key
  let value = ''
  let multiLine

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmedLine = line.replace(/^export\s+/, '').trim()

    if (!multiLine && (!trimmedLine || trimmedLine.startsWith('#'))) {
      continue
    }

    if (!multiLine && trimmedLine.includes('=')) {
      const [_key, _value] = trimmedLine.split('=')
      key = _key.trim()
      value = _value.trim()
      env[key] = replaceQuotes(value)
      const first = value[0]
      if (QUOTES.test(first) && !QUOTES.test(value[env[key].length + 1])) {
        multiLine = first
      }
    } else {
      value += '\n' + line
      env[key] = replaceQuotes(value)
      if (value[env[key].length + 1] === multiLine) {
        multiLine = undefined
        key = ''
        value = ''
      }
    }
  }

  return env
}

/**
 * @param {string} value
 * @returns {string}
 */
const replaceQuotes = (value) =>
  value.replace(/^(['"`])([^]*?)\1(?:\s*#[^]*|)$/m, '$2')
