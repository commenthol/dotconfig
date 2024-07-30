import debug from 'debug'

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
