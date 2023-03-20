import assert from 'node:assert/strict'
import { getConfig } from '../src/index.js'

describe('config', function () {
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

  it('shall ignore wrong number values', function () {
    const config = getConfig({ port: 3000 }, { PORT: 'NaN' })
    assert.deepEqual(config, {
      port: 3000
    })
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
          }
        },
        {
          PORT: '3000',
          HTTP_PROXY: 'my-proxy:1234',
          SSO_SERVER_URL: 'https://other.sso/path',
          SSO_CLIENT_SECRET: 'ƚɘɿƆɘƧ',
          ANY_OTHER_VALUE: '1234'
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
          serverUrl: 'https://other.sso/path'
        },
        anyOtherValue: '1234'
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
