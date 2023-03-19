import debug from 'debug'

const log = debug('dotconfig')

/**
 * @param {Record<string, any>|{}} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv} [env=process.env] the environment variables
 * @returns {Record<string, any>|{}}
 */
export function getConfig (defaultConfig = {}, env = process.env) {
  const config = { ...defaultConfig }

  for (let [prop, value] of Object.entries(env)) {
    const keys = snakeCaseParts(prop)
    if (!keys?.length) {
      continue
    }

    let key
    let tmp = config
    let ref = tmp
    for (let i = 0; i < keys.length; i++) {
      ref = tmp
      key = keys[i]
      const type = getType(tmp[key])
      const camelKey = snakeToCamelCase(keys.slice(i).join('_'))
      const camelType = getType(tmp[camelKey])
      log({ prop, value, key, type, camelKey, camelType })

      if (camelType !== 'Undefined' || type === 'Undefined') {
        const currValue = tmp[camelKey]
        switch (getType(currValue)) {
          case 'Number': {
            value = toNumber(value) ?? currValue
            break
          }
          case 'Boolean': {
            // @ts-expect-error
            value = toBoolean(value)
            break
          }
        }
        key = camelKey
        break
      }

      tmp = tmp[key]
    }

    ref[key] = value
  }

  return config
}

/* c8 ignore next 1 */
const getType = (any) => toString.call(any).slice(1, -1).split(' ', 2)[1] || 'Undefined'

const snakeToCamelCase = (str = '') => str.toLowerCase()
  .replace(/_(\w)/g, (_, m) => m.toUpperCase())

const snakeCaseParts = (str) => {
  if (str[0] === '_') {
    return
  }
  return str.split('_').map(str => str.toLowerCase())
}

const toNumber = (any) => Number.isSafeInteger(Number(any)) ? Number(any) : undefined

const toBoolean = (any) => any === 'true'
