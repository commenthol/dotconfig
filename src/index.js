import debug from 'debug'

const log = debug('dotconfig')

/**
 * @param {object} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv} [env=process.env] the environment variables
 * @returns {Record<string, any>|{}}
 */
export function getConfig (defaultConfig, env = process.env) {
  const { ...config } = defaultConfig || {}

  for (let [envVar, value] of Object.entries(env)) {
    const keys = snakeCaseParts(envVar)
    if (!keys?.length) {
      continue
    }

    let key = ''
    let tmp = config
    let ref = tmp
    for (let i = 0; i < keys.length; i++) {
      ref = tmp
      key = keys[i]
      const type = getType(tmp[key])
      const camelKey = snakeToCamelCase(keys.slice(i).join('_'))
      const camelType = getType(tmp[camelKey])
      // log({ envVar, value, key, type, camelKey, camelType })

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

    const camelEnvVar = snakeToCamelCase(envVar)
    const refType = getType(ref)
    const targetType = getType(ref[key])
    const isArray = refType === 'Array' && Number.isSafeInteger(Number(key)) && Number(key) >= 0

    if (isArray || (refType === 'Object' && targetType !== 'Object')) {
      ref[key] = value
    } else if (getType(config[camelEnvVar]) !== 'Object') {
      config[camelEnvVar] = value
      log('INFO: EnvVar %s is set as "%s"', envVar, camelEnvVar)
    } else {
      log('ERROR: EnvVar %s could not be set as "%s"', envVar, camelEnvVar)
    }
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

const toNumber = (any) => !isNaN(Number(any)) ? Number(any) : undefined

const toBoolean = (any) => any === 'true'
