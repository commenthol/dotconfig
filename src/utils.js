import debug from 'debug'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * @param {any} any
 * @returns {number|undefined}
 */
export const toNumber = (any) =>
  typeof any === 'string'
    ? !isNaN(Number(any))
      ? Number(any)
      : undefined
    : typeof any === 'number' && !isNaN(any)
      ? any
      : undefined

/**
 * @param {any} any
 * @returns {boolean}
 */
export const isInteger = (any) => Number.isSafeInteger(toNumber(any))

/**
 * @param {any} any
 * @returns {boolean|undefined}
 */
export const toBoolean = (any) =>
  any === 'true'
    ? true
    : any === 'false'
      ? false
      : typeof any === 'boolean'
        ? any
        : undefined

export const log = debug('@commenthol/dotconfig')

const FILE_URI = 'file://'

/**
 * @param {string|URL} path relative or absolute path to file
 * @returns {string}
 */
export const resolveFilename = (path) => {
  if (!path) return ''
  if (path instanceof URL) {
    path = fileURLToPath(path)
  }
  const _filename = path.startsWith(FILE_URI)
    ? path.slice(FILE_URI.length)
    : path
  return resolve(process.cwd(), _filename)
}

export const isFile = (path = '') => path.startsWith(FILE_URI)

/**
 * loads content from file if value starts with `file://`
 * @param {string|any} possibleFile
 * @returns {any}
 */
export const tryLoadingFile = (possibleFile) => {
  if (
    !possibleFile ||
    typeof possibleFile !== 'string' ||
    !isFile(possibleFile)
  ) {
    /* c8 ignore next 2 */
    return possibleFile
  }
  const filename = resolveFilename(possibleFile)

  try {
    return readFileSync(filename, 'utf-8')
  } catch (/** @type {Error|any} */ err) {
    log(`ERROR: Failed to load ${filename} with ${err.message}`)
  }
  return possibleFile
}
