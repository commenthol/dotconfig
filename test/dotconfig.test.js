import assert from 'node:assert/strict'
import { dotconfig, getConfig } from '../src/index.js'
import { fileURLToPath } from 'node:url'

describe('dotconfig', function () {
  describe('getConfig', function () {
    it('shall fail if defaultConfig is not an object', function () {
      try {
        getConfig(1)
        throw new Error('failed')
      } catch (e) {
        assert.equal(e.message, 'defaultConfig must be an object')
      }
    })

    it('shall pass on settings', function () {
      const config = getConfig({ url: { one: 'https://one' } }, {})
      assert.deepEqual(config, {
        url: { one: 'https://one' }
      })
    })

    it('shall convert unknown env vars to camelCase', function () {
      const config = getConfig(
        {},
        { URL_ONE: 'https://one', URL_TWO: 'https://two' }
      )
      assert.deepEqual(config, {
        urlOne: 'https://one',
        urlTwo: 'https://two'
      })
    })

    it('shall sort in env var on existing key', function () {
      const config = getConfig(
        { url: { one: '' } },
        { URL_ONE: 'https://one', URL_TWO: 'https://two' }
      )
      assert.deepEqual(config, {
        url: {
          one: 'https://one',
          two: 'https://two'
        }
      })
    })

    it('shall sort in env var on existing camelCased key', function () {
      const config = getConfig(
        { url: {}, urlOne: { three: 1 } },
        {
          URL_ONE_one: 'https://one.one',
          URL_TWO: 'https://two',
          url_one_three: '3'
        }
      )
      assert.deepEqual(config, {
        urlOne: {
          one: 'https://one.one',
          three: 3
        },
        url: {
          two: 'https://two'
        }
      })
    })

    it('shall ignore values which start with a Dash', function () {
      const config = getConfig({}, { __Url_One: 'https://one' })
      assert.deepEqual(config, {})
    })

    it('shall convert number values', function () {
      const config = getConfig({ port: 3000 }, { PORT: '3333' })
      assert.deepEqual(config, {
        port: 3333
      })
    })

    it('shall fail to coerce numbers', function () {
      try {
        getConfig({ port: 3000 }, { PORT: 'test me' })
        throw new Error('failed')
      } catch (e) {
        assert.equal(e.message, 'PORT is not a number')
      }
    })

    it('shall convert boolean values', function () {
      const config = getConfig(
        { is: { enabled: false } },
        { IS_ENABLED: 'true' }
      )
      assert.deepEqual(config, {
        is: { enabled: true }
      })
    })

    it('shall fail to coerce boolean', function () {
      try {
        getConfig(
          { is: { enabled: false } },
          { IS_ENABLED: 'not true' },
          { strictTypes: true }
        )
        throw new Error('failed')
      } catch (e) {
        assert.equal(e.message, 'IS_ENABLED is not a boolean')
      }
    })

    it('shall group env vars by number into object', function () {
      const config = getConfig(
        {
          user: { __group: true }
        },
        {
          user_0_username: 'alice',
          user_0_password: 'alice-pwd',
          user_1_username: 'bob'
        }
      )
      assert.deepEqual(config, {
        user: {
          0: { username: 'alice', password: 'alice-pwd' },
          1: { username: 'bob' }
        }
      })
    })

    it('shall group env vars by name into object', function () {
      const config = getConfig(
        {
          url: { __group: true }
        },
        {
          URL_ONE_ONE: 'http://one',
          URL_ONE_TWO: 'http://one.two',
          URL_two: 'http://two', // can't add this into a group as field is missing for group
          url_two_three: 'http://two.three'
        }
      )
      assert.deepEqual(config, {
        url: {
          one: {
            one: 'http://one',
            two: 'http://one.two'
          },
          two: {
            three: 'http://two.three'
          }
        },
        urlTwo: 'http://two'
      })
    })

    it('example', function () {
      assert.deepEqual(
        getConfig(
          {
            port: 8080,
            http: {
              proxy: undefined
            },
            sso: {
              serverUrl: 'https://my.sso',
              clientId: 'myClientId',
              clientSecret: undefined
            },
            names: [],
            user: { __group: true }
          },
          {
            PORT: '3000',
            HTTP_PROXY: 'my-proxy:1234',
            SSO_SERVER_URL: 'https://other.sso/path',
            SSO_CLIENT_SECRET: 'ƚɘɿƆɘƧ',
            SSO_REALM: 'my-realm',
            ANY_OTHER_VALUE: '1234',
            NAMES_0: 'Alice',
            NAMES_1: 'Bob',
            NAMES_2: 'Charlie',
            USER_0_USERNAME: 'Alice',
            USER_0_PASSWORD: 'correct horse battery staple',
            USER_1_USERNAME: 'Bob',
            USER_1_PASSWORD: 'ʇǝɹɔǝs'
          }
        ),
        {
          http: {
            proxy: 'my-proxy:1234'
          },
          port: 3000,
          sso: {
            clientId: 'myClientId',
            clientSecret: 'ƚɘɿƆɘƧ',
            serverUrl: 'https://other.sso/path',
            realm: 'my-realm'
          },
          anyOtherValue: '1234',
          names: ['Alice', 'Bob', 'Charlie'],
          user: {
            0: {
              username: 'Alice',
              password: 'correct horse battery staple'
            },
            1: {
              username: 'Bob',
              password: 'ʇǝɹɔǝs'
            }
          }
        }
      )
    })

    it('example (additionalProps=false)', function () {
      assert.deepEqual(
        getConfig(
          {
            port: 8080,
            http: {
              proxy: undefined
            },
            sso: {
              serverUrl: 'https://my.sso',
              clientId: 'myClientId',
              clientSecret: undefined
            },
            names: []
          },
          {
            PORT: '3000',
            HTTP_PROXY: 'my-proxy:1234',
            SSO_SERVER_URL: 'https://other.sso/path',
            SSO_CLIENT_SECRET: 'ƚɘɿƆɘƧ',
            SSO_REALM: 'my-realm',
            ANY_OTHER_VALUE: '1234',
            NAMES_0: 'Alice',
            NAMES_1: 'Bob',
            NAMES_2: 'Charlie'
          },
          { additionalProps: false }
        ),
        {
          http: {
            proxy: 'my-proxy:1234'
          },
          port: 3000,
          sso: {
            clientId: 'myClientId',
            clientSecret: 'ƚɘɿƆɘƧ',
            serverUrl: 'https://other.sso/path',
            realm: 'my-realm'
          },
          names: ['Alice', 'Bob', 'Charlie']
        }
      )
    })

    it('example (additionalPropsAll=false)', function () {
      assert.deepEqual(
        getConfig(
          {
            port: 8080,
            http: {
              proxy: undefined
            },
            sso: {
              serverUrl: 'https://my.sso',
              clientId: 'myClientId',
              clientSecret: undefined
            },
            names: ['a', 'b']
          },
          {
            PORT: '3000',
            HTTP_PROXY: 'my-proxy:1234',
            SSO_SERVER_URL: 'https://other.sso/path',
            SSO_CLIENT_SECRET: 'ƚɘɿƆɘƧ',
            SSO_REALM: 'my-realm',
            ANY_OTHER_VALUE: '1234',
            NAMES_0: 'Alice',
            NAMES_1: 'Bob',
            NAMES_2: 'Charlie'
          },
          { additionalPropsAll: false }
        ),
        {
          http: {
            proxy: 'my-proxy:1234'
          },
          port: 3000,
          sso: {
            clientId: 'myClientId',
            clientSecret: 'ƚɘɿƆɘƧ',
            serverUrl: 'https://other.sso/path'
          },
          names: ['Alice', 'Bob']
        }
      )
    })

    it('shall set array values', function () {
      assert.deepEqual(
        getConfig(
          { array: ['foo', 'bar'] },
          { ARRAY_0: 'wat', ARRAY_2: 'baz', ARRAY_4: 'four' }
        ),
        {
          array: ['wat', 'bar', 'baz', , 'four']
        }
      )
    })

    it('shall set overlapping keys', function () {
      assert.deepEqual(
        getConfig({}, { TERM_PROGRAM_VERSION: '1.0', TERM: 'abc' }),
        {
          term: 'abc',
          termProgramVersion: '1.0'
        }
      )
    })

    it('shall fail to set overlapping keys', function () {
      assert.deepEqual(
        getConfig({ term: {} }, { TERM_PROGRAM_VERSION: '1.0', TERM: 'abc' }),
        {
          term: { programVersion: '1.0' }
        }
      )
    })

    it('shall not throw with process.env', function () {
      assert.doesNotThrow(() => {
        getConfig()
      })
    })

    it('shall sort multiple values into their object', function () {
      const ENV = {
        npm_command: 'test',
        npm_config_cache: '/.npm',
        npm_config_global_prefix: '/.n',
        npm_config_globalconfig: '/.n/etc/npmrc',
        npm_config_ignore_scripts: 'true',
        npm_config_init_module: '/.npm-init.js',
        npm_config_local_prefix: '/dotconfig',
        npm_config_metrics_registry: 'https://registry.npmjs.org/',
        npm_config_node_gyp: '/.n/node-gyp/bin/node-gyp.js',
        npm_config_noproxy: '',
        npm_config_prefix: '/.n',
        npm_config_user_agent: 'npm/9.5.0 node/v18.14.2',
        npm_config_userconfig: '/.npmrc',
        npm_execpath: '/.n/lib/node_modules/npm/bin/npm-cli.js',
        npm_lifecycle_event: 'test',
        npm_lifecycle_script: 'mocha',
        npm_node_execpath: '/.n/bin/node',
        npm_package_engines_node: '>=18',
        npm_package_json: '/dotconfig/package.json',
        npm_package_name: 'dotconfig',
        npm_package_version: '0.0.0-0'
      }

      const config = getConfig(
        { npm: { config: {}, package: {}, lifecycle: {} } },
        ENV
      )
      assert.deepEqual(config, {
        npm: {
          command: 'test',
          config: {
            cache: '/.npm',
            globalconfig: '/.n/etc/npmrc',
            globalPrefix: '/.n',
            ignoreScripts: 'true',
            initModule: '/.npm-init.js',
            localPrefix: '/dotconfig',
            metricsRegistry: 'https://registry.npmjs.org/',
            nodeGyp: '/.n/node-gyp/bin/node-gyp.js',
            noproxy: '',
            prefix: '/.n',
            userAgent: 'npm/9.5.0 node/v18.14.2',
            userconfig: '/.npmrc'
          },
          execpath: '/.n/lib/node_modules/npm/bin/npm-cli.js',
          lifecycle: { event: 'test', script: 'mocha' },
          nodeExecpath: '/.n/bin/node',
          package: {
            enginesNode: '>=18',
            json: '/dotconfig/package.json',
            name: 'dotconfig',
            version: '0.0.0-0'
          }
        }
      })
    })
  })

  describe('dotconfig', function () {
    afterEach(() => {
      Reflect.deleteProperty(process.env, 'DOTENV_CONFIG_PATH')
    })
    it('shall load env file and return config', function () {
      process.env.DOTENV_CONFIG_PATH = fileURLToPath(
        new URL('./.env-test', import.meta.url)
      )

      const config = dotconfig(
        {
          port: 8080,
          http: {
            proxy: undefined
          },
          https: {
            key: '',
            cert: ''
          },
          sso: {
            serverUrl: 'https://my.sso',
            clientId: 'myClientId',
            clientSecret: undefined
          },
          names: [], // arrays must be defined!
          isProd: false
        },
        {
          // test only to avoid using any values from process.env
          processEnv: {}
        }
      )

      assert.deepStrictEqual(config, {
        anyOtherValue: '1234',
        http: {
          proxy: 'my-proxy:1234'
        },
        https: {
          cert: '-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----',
          key: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----'
        },
        names: ['Alice', 'Bob', 'Charlie'],
        port: 3000,
        sso: {
          clientId: 'myClientId',
          clientSecret: 'ƚɘɿƆɘƧ',
          serverUrl: 'https://other.sso/path'
        },
        isProd: true
      })
    })

    it('shall not load undefined file', function () {
      process.env.DOTENV_CONFIG_PATH = fileURLToPath(
        new URL('./.env-not-there', import.meta.url)
      )

      const config = dotconfig(
        {
          port: 8080,
          http: {
            proxy: undefined
          },
          sso: {
            serverUrl: 'https://my.sso',
            clientId: 'myClientId',
            clientSecret: undefined
          },
          names: [] // arrays must be defined!
        },
        {
          // test only to avoid using any values from process.env
          processEnv: {}
        }
      )

      assert.deepStrictEqual(config, {
        port: 8080,
        http: {
          proxy: undefined
        },
        sso: {
          serverUrl: 'https://my.sso',
          clientId: 'myClientId',
          clientSecret: undefined
        },
        names: [] // arrays must be defined!
      })
    })
  })
})
