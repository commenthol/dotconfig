import * as dotenv from './dotenv.js'
import { log, toNumber, toBoolean, isInteger } from './utils.js'

/** @typedef {import('./dotenv.js').DotenvConfigOptions} DotenvConfigOptions */
/**
 * @typedef {object} DotConfigOptionsExtra
 * @property {boolean} [additionalProps=true] if `false` do not add additional props on top-level not part of defaultConfig
 * @property {boolean} [additionalPropsAll=true] if `false` do not add any additional props that are not part of defaultConfig
 */
/** @typedef {DotenvConfigOptions & DotConfigOptionsExtra} DotConfigOptions */

/**
 * @param {object} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv|object} [processEnv=process.env] the environment variables
 * @param {DotConfigOptionsExtra} [options]
 * @returns {Record<string, any>|{}}
 */
export function getConfig (defaultConfig, processEnv = process.env, options) {
  const { additionalProps = true, additionalPropsAll = true } =
    options || {}
  const config = structuredClone(defaultConfig || {})
  if (typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('defaultConfig must be an object')
  }

  for (let [envVar, value] of Object.entries(processEnv)) {
    const keys = snakeCaseParts(envVar)
    if (!keys?.length) {
      continue
    }

    let key = ''
    let tmp = config
    let ref = tmp
    let doContinue = false

    for (let i = 0; i < keys.length; i++) {
      ref = tmp

      let camelKey
      for (let j = keys.length; j > i; j--) {
        const _camelKey = snakeToCamelCase(keys.slice(i, j).join('_'))
        const type = getType(tmp[_camelKey])
        if (type === 'Object') {
          i = j - 1
          camelKey = _camelKey
          break
        }
      }
      if (camelKey) {
        tmp = tmp[camelKey]
        continue
      }

      key = keys[i]
      const type = getType(tmp[key])
      camelKey = snakeToCamelCase(keys.slice(i).join('_'))
      const camelType = getType(tmp[camelKey])

      if (camelType !== 'Undefined' || type === 'Undefined') {
        const currValue = tmp[camelKey]
        switch (getType(currValue)) {
          case 'Number': {
            const coerced = toNumber(value)
            if (coerced === undefined) {
              throw new TypeError(`${envVar} is not a number`)
            }
            value = coerced
            break
          }
          case 'Boolean': {
            const coerced = toBoolean(value)
            if (coerced === undefined) {
              throw new TypeError(`${envVar} is not a boolean`)
            }
            value = coerced
            break
          }
        }
        if (
          (!additionalProps &&
            tmp === config &&
            !(camelKey in defaultConfig)) ||
          (!additionalPropsAll && !(camelKey in tmp))
        ) {
          doContinue = true
          break
        }
        key = camelKey
        break
      }

      tmp = tmp[key]
    }

    if (doContinue) {
      continue
    }

    const camelEnvVar = snakeToCamelCase(envVar)
    const refType = getType(ref)
    const targetType = getType(ref[key])
    const isArray = refType === 'Array' && isInteger(key) && Number(key) >= 0

    if (key && (isArray || (refType === 'Object' && targetType !== 'Object'))) {
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

/**
 * Generates a function comment for the given function body.
 *
 * @param {object} defaultConfig the default configuration
 * @param {DotConfigOptions} [options] - the options for the function
 * @returns {Record<string, any>|{}} the result from getConfig()
 */
export function dotconfig (defaultConfig, options) {
  let { processEnv } = options || {}
  processEnv =
    processEnv && typeof processEnv === 'object' ? processEnv : process.env
  dotenv.config({ ...options, processEnv })
  return getConfig(defaultConfig, processEnv, options)
}

/* c8 ignore next 2 */
const getType = (any) =>
  toString.call(any).slice(1, -1).split(' ', 2)[1] || 'Undefined'

const snakeToCamelCase = (str = '') =>
  str.toLowerCase().replace(/_(\w)/g, (_, m) => m.toUpperCase())

const snakeCaseParts = (str) => {
  if (str[0] === '_') {
    return
  }
  return str.split('_').map((str) => str.toLowerCase())
}
