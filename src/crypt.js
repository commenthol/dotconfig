import { encrypt, decrypt, PrivateKey } from 'eciesjs'
import { log, tryLoadingFile } from './utils.js'

export const DOTENV_PUBLIC_KEY = 'DOTENV_PUBLIC_KEY'
const DOTENV_PRIVATE_KEY = 'DOTENV_PRIVATE_KEY'
export const PREFIX = 'encrypted:'

/**
 * @param {any} value
 * @param {string} publicKey
 * @returns {string}
 */
export function encryptValue(value, publicKey) {
  const ciphertext = encrypt(publicKey, Buffer.from(value))
  // @ts-expect-error
  const encoded = Buffer.from(ciphertext, 'hex').toString('base64') // base64 encode ciphertext
  return `${PREFIX}${encoded}`
}

/**
 * @param {string} envVar
 * @param {string} value
 * @param {string[]} [privateKeys]
 * @param {boolean} [throwOnDecryptionError=true]
 * @returns {string}
 */
export function decryptValue(
  envVar,
  value,
  privateKeys = [],
  throwOnDecryptionError = true
) {
  if (!value.startsWith(PREFIX)) {
    return value
  }

  let decryptedValue
  for (const key of privateKeys) {
    const secret = Buffer.from(key, 'hex')
    const encoded = value.substring(PREFIX.length)
    const ciphertext = Buffer.from(encoded, 'base64')

    try {
      decryptedValue = decrypt(secret, ciphertext).toString()
      break
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // supress error
    }
  }

  if (decryptedValue === undefined || decryptedValue === null) {
    if (throwOnDecryptionError) {
      throw new Error(`Decryption failed for ${envVar}`)
    }
    log('WARN: %s could not be decrypted', envVar)
    return value
  }

  return decryptedValue
}

/**
 * @param {string} [existingPrivateKey]
 * @returns {{
 *  publicKey: string
 *  privateKey: string
 * }}
 */
export function keyPair(existingPrivateKey) {
  let kp

  if (existingPrivateKey) {
    kp = new PrivateKey(Buffer.from(existingPrivateKey, 'hex'))
  } else {
    kp = new PrivateKey()
  }

  const publicKey = kp.publicKey.toHex()
  const privateKey = kp.secret.toString('hex')

  return {
    publicKey,
    privateKey
  }
}

/**
 * @param {NodeJS.ProcessEnv} processEnv
 * @param {boolean} [doDelete=true] delete private keys from process.env
 * @returns {string[]}
 */
export function getPrivateKeys(processEnv, doDelete = true) {
  const publicKeys = []
  for (const envVar of Object.keys(processEnv)) {
    if (!envVar.startsWith(DOTENV_PRIVATE_KEY)) {
      continue
    }
    const value = tryLoadingFile(processEnv[envVar] || '')
    const keys = value.split(',').reduce((acc, v) => {
      if (v) {
        acc.push(v.trim())
      }
      return acc
    }, [])
    publicKeys.push(...keys)
    if (doDelete) {
      // delete any private keys to prevent global access
      Reflect.deleteProperty(processEnv, envVar)
      Reflect.deleteProperty(process.env, envVar)
    }
  }
  return publicKeys
}

/**
 * @param {Record<string,string|boolean|number>} processEnv
 * @returns {{key: string, value: string}|undefined}
 */
export function getFirstPublicKey(processEnv) {
  for (const [key, value] of Object.entries(processEnv || {})) {
    if (key.startsWith(DOTENV_PUBLIC_KEY)) {
      return { key, value: '' + value }
    }
  }
}
