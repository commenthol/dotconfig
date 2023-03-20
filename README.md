# dotconfig

Config helper to (magically) override application settings with environment
variables.

# Install

Add to your project:

```
npm i @commenthol/dotconfig
```

# Usage

File: `./config.js`

```js
import dotenv from "dotenv";
import { getConfig } from "@commenthol/dotconfig";

// load process env vars from .env file and process env-vars
dotenv.config();

export const config = getConfig({
  port: 8080,
  http: {
    proxy: undefined,
  },
  sso: {
    serverUrl: "https://my.sso",
    clientId: "myClientId",
    clientSecret: undefined,
  },
  names: [], // arrays must be defined!
});
```

with file: `./.env`

```sh
export PORT=3000
export HTTP_PROXY=my-proxy:1234
export SSO_SERVER_URL=https://other.sso
export SSO_CLIENT_SECRET=ƚɘɿƆɘƧ
export NAMES_0=Alice
export NAMES_1=Bob
export NAMES_2=Charlie
export ANY_OTHER_VALUE=1234
```

results in `config` being exported as

```js
const config = {
  http: {
    proxy: "my-proxy:1234",
  },
  port: 3000,
  sso: {
    serverUrl: "https://other.sso/path",
    clientId: "myClientId",
    clientSecret: "ƚɘɿƆɘƧ",
  },
  names: ["Alice", "Bob", "Charlie"],
  anyOtherValue: "1234",
};
```

# License

MIT licensed
