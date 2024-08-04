import assert from 'node:assert/strict'
import {
  encryptValue,
  decryptValue,
  keyPair,
  getPrivateKeys
} from '../src/crypt.js'

describe('crypto', function () {
  let publicKey
  let privateKey

  before(() => {
    const kp = keyPair()
    publicKey = kp.publicKey
    privateKey = kp.privateKey
  })

  describe('keyPair', function () {
    it('shall obtain key pair from existing private key', function () {
      const kp = keyPair(privateKey)
      assert.equal(kp.privateKey, privateKey)
      assert.equal(kp.publicKey, publicKey)
    })
  })

  describe('decryptValue()', function () {
    it('decryptValue', function () {
      const encrypted = encryptValue('hello', publicKey)
      const decrypted = decryptValue('HELLO', encrypted, [privateKey])
      assert.equal(decrypted, 'hello')
    })

    it('decryptValue (does not start with encrypted:) returns raw value', function () {
      const decrypted = decryptValue('WORLD', 'world', [privateKey])
      assert.equal(decrypted, 'world') // return the original raw value
    })

    it('decryptValue (fails decryption) returns raw value', function () {
      const decrypted = decryptValue(
        'ENC1234',
        'encrypted:1234',
        [privateKey],
        false
      )
      assert.equal(decrypted, 'encrypted:1234')
    })

    it('decryptValue (fails decryption) throws', function () {
      try {
        decryptValue('ENC1234', 'encrypted:1234', [privateKey])
        throw new Error()
      } catch (err) {
        assert.equal(err.message, 'Decryption failed for ENC1234')
      }
    })

    it('decryptValue when empty string', function () {
      const encrypted = encryptValue('', publicKey)
      const decrypted = decryptValue('EMPTY', encrypted, [privateKey])
      assert.equal(decrypted, '')
    })
  })

  describe('getPrivateKeys()', function () {
    it('getPrivateKeys', function () {
      const processEnv = {
        DOTENV_PRIVATE_KEY: 'a',
        DOTENV_PRIVATE_KEY_ENV: 'b',
        DOTENV_PRIVATE_KEY_EMPTY: '',
        DOTENV_PRIVATE_KEY_UNDEFINED: undefined,
        DOTENV_PRIVATE_KEY_NULL: null,
        DOTENV_PRIVATE_KEY_CONCAT: 'c,,d ,  e'
      }
      const actual = getPrivateKeys(processEnv)
      assert.deepEqual(actual, ['a', 'b', 'c', 'd', 'e'])
      assert.equal(processEnv.DOTENV_PRIVATE_KEY, undefined)
    })

    it('shall delete private keys from process.env', function () {
      process.env.DOTENV_PRIVATE_KEY = 'secret'
      const actual = getPrivateKeys(process.env)
      assert.deepEqual(actual, ['secret'])
      assert.equal(process.env.DOTENV_PRIVATE_KEY, undefined)
    })
  })
})
