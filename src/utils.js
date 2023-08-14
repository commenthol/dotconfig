import debug from 'debug'

export const toNumber = (any) => (!isNaN(Number(any)) ? Number(any) : undefined)

export const toBoolean = (any) => any === 'true'

export const log = debug('@commenthol/dotconfig')
