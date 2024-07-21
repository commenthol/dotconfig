import debug from 'debug'

export const toNumber = (any) =>
  typeof any === 'string'
    ? !isNaN(Number(any))
      ? Number(any)
      : undefined
    : typeof any === 'number' && !isNaN(any)
      ? any
      : undefined

export const isInteger = (any) => Number.isSafeInteger(toNumber(any))

export const toBoolean = (any) =>
  any === 'true'
    ? true
    : any === 'false'
      ? false
      : typeof any === 'boolean'
        ? any
        : undefined

export const log = debug('@commenthol/dotconfig')
