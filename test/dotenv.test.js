import assert from 'assert/strict'
import { parse, config } from '../src/dotenv.js'

const fixturesFile = {
  env: new URL('./fixtures/.env', import.meta.url),
  envEnc: new URL('./fixtures/.env-enc', import.meta.url)
}

describe('dotenv', function () {
  describe('parse', function () {
    it('should return an object with the correct key-value pairs when given valid content', () => {
      const result = parse('FOO=bar\nBAZ=qux\nX=123')
      assert.deepStrictEqual(result.env, { FOO: 'bar', BAZ: 'qux', X: '123' })
    })

    it('should return an empty object when given an empty string', () => {
      const result = parse('')
      assert.deepStrictEqual(result.env, {})
    })

    it('should ignore commented lines starting with "#"', () => {
      const result = parse(
        '# This is a comment\nFOO=bar\n# Another comment\nBAZ=qux\n'
      )
      assert.deepStrictEqual(result.env, { FOO: 'bar', BAZ: 'qux' })
    })

    it('should handle values with special characters properly', () => {
      const result = parse('SPECIAL=\'This is a "special" value\'\n')
      assert.deepStrictEqual(result.env, {
        SPECIAL: 'This is a "special" value'
      })
    })

    it('should handle values enclosed in double quotes', () => {
      const content = 'NAME="John Doe"\n'
      const result = parse(content)
      assert.deepStrictEqual(result.env, { NAME: 'John Doe' })
    })

    it('should handle values enclosed in double quotes with spaces', () => {
      const content = 'NAME="   John Doe   "\n'
      const result = parse(content)
      assert.deepStrictEqual(result.env, { NAME: '   John Doe   ' })
    })

    it('should handle values enclosed in single quotes', () => {
      const content = "NAME='John Doe'\n"
      const result = parse(content)
      assert.deepStrictEqual(result.env, { NAME: 'John Doe' })
    })

    it('should handle values enclosed in backticks', () => {
      const content = 'NAME=`John M\' Doe"`\n'
      const result = parse(content)
      assert.deepStrictEqual(result.env, { NAME: 'John M\' Doe"' })
    })

    it('considers in line comments', () => {
      const content = 'NAME="John " # Doe'
      const result = parse(content)
      assert.deepStrictEqual(result.env, { NAME: 'John ' })
    })

    it('considers multi line values', () => {
      const content = 'NAME="John\n M\' # comment \nDoe" # Doe\nFOO=bar'
      const result = parse(content)
      assert.deepStrictEqual(result.env, {
        NAME: "John\n M' # comment \nDoe",
        FOO: 'bar'
      })
    })

    it('should parse content with key-value pairs', function () {
      const content =
        '# Comments\nexport KEY1=value1\nexport KEY2="value2"\nexport KEY3=\'value3\'\nexport KEY4="multi-line\n      value4"'
      const result = parse(content)
      assert.deepStrictEqual(result.env, {
        KEY1: 'value1',
        KEY2: 'value2',
        KEY3: 'value3',
        KEY4: 'multi-line\n      value4'
      })
    })

    it('should parse content with empty lines and comments', function () {
      const content =
        '\n      # Comments\n\nexport KEY1=value1\n\nexport KEY2="value2"\n\nexport KEY3=\'value3\''
      const result = parse(content)
      assert.deepStrictEqual(result.env, {
        KEY1: 'value1',
        KEY2: 'value2',
        KEY3: 'value3'
      })
    })

    it('should parse content with multi-line values', function () {
      const content =
        'export KEY1="multi-line\n  value1"\nexport KEY2=\'multi-line\n  value2\'\nKEY3=\'"value3\\\'\'\nKEY4="value4"'
      const expected = {
        KEY1: 'multi-line\n  value1',
        KEY2: 'multi-line\n  value2',
        KEY3: '"value3\'',
        KEY4: 'value4'
      }
      const result = parse(content)
      assert.deepStrictEqual(result.env, expected)
    })

    it('should parse content with leading export keyword', function () {
      const content = 'export KEY1=value1\n   KEY2=value2'
      const result = parse(content)
      assert.deepStrictEqual(result.env, {
        KEY1: 'value1',
        KEY2: 'value2'
      })
    })

    it('should parse content with duplicate keys', function () {
      const content = 'export KEY=value1\nexport KEY=value2'
      const result = parse(content)
      assert.deepStrictEqual(result.env, {
        KEY: 'value2'
      })
    })

    it('should parse content with multiline', function () {
      const content = `KEY_QUOTES_DOUBLE_MULTILINE="value escaped\\"\n  over \n  'some' # this is not a comment\n  lines" # but this is a comment `
      const result = parse(content)
      assert.deepStrictEqual(result, {
        env: {
          KEY_QUOTES_DOUBLE_MULTILINE:
            "value escaped\"\n  over \n  'some' # this is not a comment\n  lines"
        },
        tokens: [
          {
            line: 'KEY_QUOTES_DOUBLE_MULTILINE="value escaped\\"\n  over \n  \'some\' # this is not a comment\n  lines" # but this is a comment ',
            key: 'KEY_QUOTES_DOUBLE_MULTILINE',
            value:
              "value escaped\"\n  over \n  'some' # this is not a comment\n  lines",
            comment: ' # but this is a comment ',
            quoteChar: '"'
          }
        ]
      })
    })
  })

  describe('config', function () {
    it('shall parse .env file', function () {
      const processEnv = { KEY: 'do not override' }
      const { parsed } = config({
        path: fixturesFile.env,
        processEnv
      })
      assert.deepStrictEqual(parsed, {
        KEY: 'value',
        KEY_QUOTES_DOUBLE: 'value in double quotes',
        KEY_QUOTES_SINGLE: 'value in single quotes',
        KEY_BACKTICKS: 'value in backticks',
        KEY_QUOTES_DOUBLE_COMMENT:
          "value in 'double' quotes `and` a line comment",
        KEY_QUOTES_SINGLE_COMMENT:
          'value in "single" quotes `and` a line comment',
        KEY_BACKTICKS_COMMENT: 'value in \'backticks\' "and" a line comment',
        KEY_QUOTES_DOUBLE_MULTILINE:
          "value\n  over \n  'some' # this is not a comment\n  lines",
        KEY_QUOTES_SINGLE_MULTILINE:
          'value\n  over \n  "some" # this is not a comment\n  lines',
        KEY_BACKTICKS_MULTILINE:
          'value\n  over \n  "some" # this is not a comment\n  lines'
      })
      assert.equal(processEnv.KEY, 'do not override')
    })

    it('should override existing process environment variables', function () {
      const originalEnv = process.env
      process.env.KEY = 'originalValue'
      const { parsed } = config({
        path: fixturesFile.env,
        override: true
      })
      assert.deepStrictEqual(parsed, {
        KEY: 'value',
        KEY_QUOTES_DOUBLE: 'value in double quotes',
        KEY_QUOTES_SINGLE: 'value in single quotes',
        KEY_BACKTICKS: 'value in backticks',
        KEY_QUOTES_DOUBLE_COMMENT:
          "value in 'double' quotes `and` a line comment",
        KEY_QUOTES_SINGLE_COMMENT:
          'value in "single" quotes `and` a line comment',
        KEY_BACKTICKS_COMMENT: 'value in \'backticks\' "and" a line comment',
        KEY_QUOTES_DOUBLE_MULTILINE:
          "value\n  over \n  'some' # this is not a comment\n  lines",
        KEY_QUOTES_SINGLE_MULTILINE:
          'value\n  over \n  "some" # this is not a comment\n  lines',
        KEY_BACKTICKS_MULTILINE:
          'value\n  over \n  "some" # this is not a comment\n  lines'
      })
      assert.strictEqual(process.env.KEY, 'value')
      process.env = originalEnv
    })

    it('shall parse .env-enc file with encrypted values', function () {
      const DOTENV_PUBLIC_KEY =
        '03d599cf2e4febf5e149ab727132117314a640e560f0d5c2395742e8219e9dbeee'
      const HELLO =
        'encrypted:BOyGm1Oug6X4b+Sy0sWOz+vqXrwwrP00j56asdYJhHW87Hij+fZSua3Mx3tF+3Vo9z8MQNcOVBvXApjyUYmYy2nu/mFnoVxq3ehoA4f+hu2hw7i8Y8BMwtJ2/j7+PtP1nThQ6YCw'

      const processEnv = { KEY: 'do not override' }
      const { parsed, privateKeys } = config({
        path: fixturesFile.envEnc,
        processEnv
      })
      assert.deepStrictEqual(parsed, {
        KEY: 'value',
        'DOTENV_PUBLIC_KEY_DEVELOPMENT-ENC': DOTENV_PUBLIC_KEY,
        HELLO
      })
      assert.deepStrictEqual(processEnv, {
        KEY: 'do not override',
        'DOTENV_PUBLIC_KEY_DEVELOPMENT-ENC': DOTENV_PUBLIC_KEY,
        HELLO
      })
      assert.deepEqual(privateKeys, [
        '1a0c83d2a349d756f6f78f0c150e258dc67f8cc54acb77e4f8b47c67950caffa'
      ])
    })

    it('shall fail to parse .enc-enc file with non existing keys file', function () {
      try {
        const processEnv = { DOTENV_PRIVATE_KEYS_PATH: 'not there' }
        config({
          path: fixturesFile.envEnc,
          processEnv
        })
        throw new Error()
      } catch (err) {
        assert.equal(
          err.message,
          'No private keys for DOTENV_PUBLIC_KEY* found'
        )
      }
    })
  })
})
