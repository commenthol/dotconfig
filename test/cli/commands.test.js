import assert from 'assert'
import sinon from 'sinon'
import fs from 'fs'
import { resolveFilename } from '../../src/utils.js'
import {
  postfixFromFilename,
  createNewKeys,
  printDotFile,
  commands
} from '../../src/cli/commands.js'
import { PREFIX } from '../../src/crypt.js'

const fixturesFile = {
  env: './test/fixtures/cli/.env',
  envKeys: './test/fixtures/cli/.env.keys'
}

describe('cli/commands', function () {
  describe('postfixFromFilename()', function () {
    it('shall postfix .env-a', function () {
      assert.equal(postfixFromFilename('.env-a'), '_DEVELOPMENT-A')
    })

    it('shall postfix .enva', function () {
      assert.equal(postfixFromFilename('.enva'), '_DEVELOPMENTA')
    })

    it('shall postfix .a', function () {
      assert.equal(postfixFromFilename('.a'), '_DEVELOPMENT-A')
    })

    it('shall postfix .env.a', function () {
      assert.equal(postfixFromFilename('.env.a'), '_A')
    })

    it('shall postfix .env', function () {
      assert.equal(postfixFromFilename('.env'), '')
    })
  })

  describe('createNewKeys()', function () {
    it('shall create new keypair', function () {
      const input = {
        file: '.env',
        privateKey:
          '47a7910de3235c7b4ce329c2450f2a5210e5e654dc14b43dc1bf1003b7f2980b'
      }
      const actual = createNewKeys(input)
      const expected = {
        publicKey:
          '036c05ed89957871c65b64c7b80ba983ec30431f1af4f9ce55eb844cf6af48c9d3',
        tokens: [
          {
            line:
              '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/\n' +
              '#/            public-key encryption for .env files          /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PUBLIC_KEY',
            value:
              '036c05ed89957871c65b64c7b80ba983ec30431f1af4f9ce55eb844cf6af48c9d3'
          },
          { line: '' }
        ],
        tokensKeys: [
          {
            line:
              '#/------------------!DOTENV_PRIVATE_KEYS!-------------------/\n' +
              '#/ private decryption keys. DO NOT commit to source control /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            line: '# .env'
          },
          {
            key: 'DOTENV_PRIVATE_KEY',
            value:
              '47a7910de3235c7b4ce329c2450f2a5210e5e654dc14b43dc1bf1003b7f2980b'
          },
          { line: '' }
        ]
      }
      assert.deepEqual(actual, expected)
      assert.equal(
        printDotFile(actual.tokens),
        '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/\n' +
          '#/            public-key encryption for .env files          /\n' +
          '#/----------------------------------------------------------/\n' +
          'DOTENV_PUBLIC_KEY=036c05ed89957871c65b64c7b80ba983ec30431f1af4f9ce55eb844cf6af48c9d3\n'
      )
      assert.equal(
        printDotFile(actual.tokensKeys),
        '#/------------------!DOTENV_PRIVATE_KEYS!-------------------/\n' +
          '#/ private decryption keys. DO NOT commit to source control /\n' +
          '#/----------------------------------------------------------/\n' +
          '# .env\n' +
          'DOTENV_PRIVATE_KEY=47a7910de3235c7b4ce329c2450f2a5210e5e654dc14b43dc1bf1003b7f2980b\n'
      )
    })

    it('shall append keypair', function () {
      const input = {
        file: '.env',
        privateKey:
          '8c522978f89b2c7531e5140922c4d3d5d62673da7c4777502830cc61347ad185',
        tokens: [
          {
            line:
              '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/\n' +
              '#/            public-key encryption for .env files          /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PUBLIC_KEY',
            value:
              '036c05ed89957871c65b64c7b80ba983ec30431f1af4f9ce55eb844cf6af48c9d3'
          },
          { line: '' }
        ],
        tokensKeys: [
          {
            line:
              '#/------------------!DOTENV_PRIVATE_KEYS!-------------------/\n' +
              '#/ private decryption keys. DO NOT commit to source control /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PRIVATE_KEY',
            value:
              '47a7910de3235c7b4ce329c2450f2a5210e5e654dc14b43dc1bf1003b7f2980b'
          },
          { line: '' }
        ]
      }
      const actual = createNewKeys(input)
      const expected = {
        publicKey:
          '03c697992a2f93755a3befc625f0c5fd2e95b5bdce2545b5fc533f79978c33c3b5',
        tokens: [
          {
            line:
              '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/\n' +
              '#/            public-key encryption for .env files          /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PUBLIC_KEY',
            value:
              '03c697992a2f93755a3befc625f0c5fd2e95b5bdce2545b5fc533f79978c33c3b5'
          },
          { line: '' },
          {
            line:
              '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/\n' +
              '#/            public-key encryption for .env files          /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PUBLIC_KEY',
            value:
              '036c05ed89957871c65b64c7b80ba983ec30431f1af4f9ce55eb844cf6af48c9d3'
          },
          { line: '' }
        ],
        tokensKeys: [
          {
            line:
              '#/------------------!DOTENV_PRIVATE_KEYS!-------------------/\n' +
              '#/ private decryption keys. DO NOT commit to source control /\n' +
              '#/----------------------------------------------------------/'
          },
          {
            key: 'DOTENV_PRIVATE_KEY',
            value:
              '47a7910de3235c7b4ce329c2450f2a5210e5e654dc14b43dc1bf1003b7f2980b,8c522978f89b2c7531e5140922c4d3d5d62673da7c4777502830cc61347ad185'
          },
          { line: '' }
        ]
      }
      assert.deepEqual(actual, expected)
    })
  })

  describe('commands.encrypt, commands.decrypt', function () {
    before(function () {
      unlinkFiles([fixturesFile.env, fixturesFile.envKeys])
    })

    let pe
    beforeEach(function () {
      pe = { ...process.env }
      sinon.spy(console, 'info')
    })
    afterEach(function () {
      process.env = pe
      sinon.restore()
    })

    it('shall encrypt new value', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['foo', 'bar']
      }
      const conf = commands.prepare(flags)
      commands.encrypt(conf, flags)
      assert.deepEqual(console.info.getCall(0).args, [
        '✔︎ value of key "foo" encrypted (./test/fixtures/cli/.env)'
      ])
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.foo.startsWith(PREFIX), true)
    })

    it('shall encrypt key with different value', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['foo', 'baz']
      }
      const conf = commands.prepare(flags)
      const foo = conf.parsed.foo
      commands.encrypt(conf, flags)
      assert.deepEqual(console.info.getCall(0).args, [
        '✔︎ value of key "foo" encrypted (./test/fixtures/cli/.env)'
      ])
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.foo.startsWith(PREFIX), true)
      assert.notEqual(result.parsed.foo, foo)
    })

    it('shall silently fail if trying to encrypt non existing value', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['hi']
      }
      const conf = commands.prepare(flags)
      commands.encrypt(conf, flags)
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.hi, undefined)
    })

    it('shall decrypt value', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['foo']
      }
      const conf = commands.prepare(flags)
      commands.decrypt(conf, flags)
      assert.deepEqual(console.info.getCall(0).args, [
        '✔︎ value of key "foo" decrypted (./test/fixtures/cli/.env)'
      ])
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.foo.startsWith(PREFIX), false)
      assert.equal(result.parsed.foo, 'baz')
    })

    it('shall silently fail if trying to decrypt non existing value', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['hi']
      }
      const conf = commands.prepare(flags)
      commands.decrypt(conf, flags)
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.hi, undefined)
    })

    it('shall encrypt existing key', function () {
      const flags = {
        file: fixturesFile.env,
        keys: fixturesFile.envKeys,
        args: ['foo']
      }
      const conf = commands.prepare(flags)
      const foo = conf.parsed.foo
      commands.encrypt(conf, flags)
      assert.deepEqual(console.info.getCall(0).args, [
        '✔︎ value of key "foo" encrypted (./test/fixtures/cli/.env)'
      ])
      // re-read
      const result = commands.prepare(flags)
      assert.equal(result.parsed.foo.startsWith(PREFIX), true)
      assert.notEqual(result.parsed.foo, foo)
    })
  })

  describe('commands.publickey', function () {
    beforeEach(function () {
      sinon.spy(console, 'info')
    })
    afterEach(function () {
      sinon.restore()
    })

    it('shall return public key from private key', function () {
      commands.publickey({
        args: [
          '1a0c83d2a349d756f6f78f0c150e258dc67f8cc54acb77e4f8b47c67950caffa'
        ]
      })
      assert.deepEqual(console.info.getCall(0).args, [
        '03d599cf2e4febf5e149ab727132117314a640e560f0d5c2395742e8219e9dbeee'
      ])
    })

    it('shall fail to return public key if not a private key', function () {
      try {
        commands.publickey({ args: ['failing'] })
        throw new Error()
      } catch (err) {
        assert.equal(err.message, 'Invalid private key')
      }
    })
  })
})

function unlinkFiles(files) {
  for (let file of files) {
    try {
      console.debug(resolveFilename(file))
      fs.unlinkSync(resolveFilename(file))
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // console.error(e)
    }
  }
}
