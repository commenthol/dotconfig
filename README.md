# dotconfig

Config helper to (magically) override application settings with environment
variables.

Comes packaged with a dotenv file loader.

# Install

Add to your project:

```
npm i @commenthol/dotconfig
```

# Usage

File: `./config.js`

```js
import { dotconfig } from '@commenthol/dotconfig'

// loads process env vars from .env file and process env-vars
export const config = dotconfig({
  port: 8080,
  http: {
    proxy: undefined,
  },
  https: {
    cert: '',
    key: ''
  },
  sso: {
    serverUrl: 'https://my.sso',
    clientId: 'myClientId',
    clientSecret: undefined,
  },
  isProd: false,
  names: [], // arrays must be defined!
  user: { 
    __group: true // groups env vars into object
                  // Here env-var MUST have min 3 parts with min 2 dashes!
  },
  loadFile: ''
})
```

with file: `./.env`

```sh
export PORT=3000
export HTTP_PROXY=my-proxy:1234
export SSO_SERVER_URL=https://other.sso/path
export SSO_CLIENT_SECRET=ƚɘɿƆɘƧ
export NAMES_0=Alice
export NAMES_1=Bob
export NAMES_2=Charlie
export USER_0_USERNAME=Alice
export USER_0_PASSWORD="correct horse battery staple"
export USER_1_USERNAME=Bob
export USER_1_PASSWORD=ʇǝɹɔǝs
export IS_PROD=true
export ANY_OTHER_VALUE=1234
# Multi line values are supported (set them in quotes!)
export HTTPS_KEY="-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----"
export HTTPS_CERT='-----BEGIN CERTIFICATE-----
MIID...
-----END CERTIFICATE-----'
# loads content from file relative: `file://./relative` absolute: `file:///absolute`
export LOAD_FILE='file://./cert.key'
```

results in `config` being exported as

```js
const config = {
  http: {
    proxy: 'my-proxy:1234',
  },
  https: {
    key: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
    cert: '-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----'
  },
  port: 3000,
  sso: {
    serverUrl: 'https://other.sso/path',
    clientId: 'myClientId',
    clientSecret: 'ƚɘɿƆɘƧ',
  },
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
  },
  isProd: true,
  anyOtherValue: '1234',
  // the content from `LOAD_FILE`
  loadFile: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----'
}
```

# API 

## dotconfig 

dotconfig calls `dotenv.config()` first before passing the parsed `process.env`
variables through `getConfig()`.

<details>
<summary><i>Types</i></summary>

```ts
function dotconfig(
    /**
     * The default configuration object
     */
    defaultConfig: object, 
    /**
     * optional configuration options.
     */
    options?: DotConfigOptions
): Record<string, any> | {};

type DotConfigOptions = {
    /**
     * The path to the dotenv file. Default is '.env' in the current working 
     * directory. May be set via DOTENV_CONFIG_PATH env var.
     */
    path?: string | URL | undefined;
    /**
     * The encoding of the dotenv file. 
     * May be set via DOTENV_CONFIG_ENCODING env var.
     */
    encoding?: BufferEncoding | undefined;
    /**
     * Whether to override existing process environment variables. 
     * Default is false. May be set with DOTENV_CONFIG_OVERRIDE=true env var.
     */
    override?: boolean | undefined;
    /**
     * The process environment object to update. Default is `process.env`.
     */
    processEnv?: NodeJS.ProcessEnv | object;
    /**
     * if `false` do not add additional props on top-level not part of defaultConfig
     */
    additionalProps?: boolean | undefined;
    /**
     * if `false` do not add any additional props that are not part of defaultConfig
     */
    additionalPropsAll?: boolean | undefined;
};
```

</details>

## dotenv 

dotenv comes with two methods `parse()` and `config()`. 

`dotenv.config()` returns the parsed `.env` file (if found).

*Usage*

```js
import { dotenv } from '@commenthol/dotconfig'

// loads `.env` in current working directory
dotenv.config()

// loads `.env-local` relative to file
dotenv.config({ 
  path: new URL('./.env-local', import.meta.url)
})
```

<details>
<summary><i>Types</i></summary>

```ts
function config (
  /**
   * optional configuration options.
   * see types above at dotconfig.
   */
  options?: DotenvConfigOptions
): Record<string, any> | {};

type DotenvConfigOptions = {
    /**
     * The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
     */
    path?: string | URL | undefined;
    /**
     * The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
     */
    encoding?: BufferEncoding | undefined;
    /**
     * Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
     */
    override?: boolean | undefined;
    /**
     * The process environment object to update. Default is `process.env`.
     */
    processEnv?: NodeJS.ProcessEnv | object;
};
```

</details>

## getConfig

Applies the lower camel-cased `process.env` variables onto the default
configuration.

*Usage*

```js
import { getConfig } from '@commenthol/dotconfig'

process.env.HTTP_PORT = '8080'
process.env.HTTPS_PORT = '8443'

const config = getConfig({
  http: { port: 80 },
  https: { port: 443 }
})
//> config = {
//>  http: { port: 8080 },
//>  https: { port: 8443 }
//> }
```

# License

MIT licensed
