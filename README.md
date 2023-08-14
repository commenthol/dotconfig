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
export IS_PROD=true
export ANY_OTHER_VALUE=1234
# Multi line values are supported (set them in quotes!)
export HTTPS_KEY="-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----"
export HTTPS_CERT='-----BEGIN CERTIFICATE-----
MIID...
-----END CERTIFICATE-----'
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
  isProd: true,
  anyOtherValue: '1234',
}
```

# API 

## dotconfig 

dotconfig calls dotenv.config() first before passing the parsed process.env
variables through getConfig().

*Types*

```ts
type DotenvConfigOptions = {
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
};

function dotconfig(
    /**
     * The default configuration object
     */
    defaultConfig: object, 
    /**
     * optional configuration options.
     */
    options?: DotenvConfigOptions
): Record<string, any> | {};
```

## dotenv 

dotenv comes with two methods parse() and config(). 

config() returns the parsed .env file (if found).

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

*Types*

```ts
function config (
  /**
   * optional configuration options.
   * see types above at dotconfig.
   */
  options?: DotenvConfigOptions
): Record<string, any> | {};
```

## getConfig

Applies the lower camel-cased process.env variables onto the default
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
// config = {
//  http: { port: 8080 },
//  https: { port: 8443 }
// }
```

# License

MIT licensed
