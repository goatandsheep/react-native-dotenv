# react-native-dotenv [![NPM version](https://img.shields.io/npm/v/react-native-dotenv.svg?style=flat-square)](https://www.npmjs.com/package/react-native-dotenv) [![downloads](https://img.shields.io/npm/dw/react-native-dotenv)](https://www.npmjs.com/package/react-native-dotenv)

<img src="https://raw.githubusercontent.com/motdotla/dotenv/master/dotenv.svg" alt="dotenv" align="right" width="200" />

Load environment variables using import statements.

&nbsp;

## Usage

Install it.

```sh
npm install react-native-dotenv --save-dev
```

Add it to your Babel config:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(false)
  return {
    plugins: [
      ['module:react-native-dotenv']
    ]
  }
}
```

Create a `.env` file in the root of your project:

```ini
# .env
HELLO="Dotenv"
API_URL=https://api.example.org
```

Import your environment variables:

```js
// App.js
import { HELLO, API_URL } from '@env'

console.log(`Hello ${HELLO}`)
fetch(`${API_URL}/users`)
```

That's it. Your environment variables from `.env` are available via `@env`.

&nbsp;

## Advanced

<details><summary><code>envName</code> (default: <code>'APP_ENV'</code>)</summary><br>

Override which environment variable selects the mode file (separate from `NODE_ENV`). Metro can overwrite the test environment even if you specify a config, so this gives you a dedicated override.

```json
// package.json
{
  "scripts": {
    "start:staging": "APP_ENV=staging npx react-native start"
  }
}
```

The above example would use the `.env.staging` file.

To use your own name:

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "envName": "MY_ENV"
    }]
  ]
}
```

```json
// package.json
{
  "scripts": {
    "start:staging": "MY_ENV=staging npx react-native start"
  }
}
```

Note: if you're using `APP_ENV` (or `envName`), you cannot use `development` nor `production` as values, and you should avoid having a `.env.development` or `.env.production`. This is a Babel and Node thing that I have little control over unfortunately and is consistent with many other platforms that have an override option, like [Gatsby](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#additional-environments-staging-test-etc). If you want to use `development` and `production`, you should not use `APP_ENV` (or `envName`), but rather the built-in `NODE_ENV=development` or `NODE_ENV=production` or you can just use `debug` vs `release` modes. It actually does compile but only for the `start` command so it is up to you but then you have to run `react-native start` every time you change the values.

</details>
<details><summary><code>moduleName</code> (default: <code>'@env'</code>)</summary><br>

The module name used in import statements.

```js
import { HELLO } from '@env'
```

For TypeScript or Next.js it is often advised to set `moduleName` to `react-native-dotenv`.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "moduleName": "react-native-dotenv"
    }]
  ]
}
```

</details>
<details><summary><code>path</code> (default: <code>'.env'</code>)</summary><br>

Path to the base env file.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "path": ".env"
    }]
  ]
}
```

</details>
<details><summary><code>allowlist</code> (default: <code>null</code>)</summary><br>

Limit imports to only these env variable names.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "allowlist": [
        "HELLO",
        "API_URL"
      ]
    }]
  ]
}
```

</details>
<details><summary><code>blocklist</code> (default: <code>null</code>)</summary><br>

Prevent these env variable names from being imported.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "blocklist": [
        "GITHUB_TOKEN"
      ]
    }]
  ]
}
```

</details>
<details><summary><code>safe</code> (default: <code>false</code>)</summary><br>

Only allow environment variables defined in the `.env` file. This completely ignores everything already defined in the environment.

The `.env` file has to exist.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "safe": true
    }]
  ]
}
```

When using safe mode, it's highly recommended to set `allowUndefined` to `false`.

</details>
<details><summary><code>allowUndefined</code> (default: <code>true</code>)</summary><br>

Allow importing undefined variables; their value will be `undefined`.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "allowUndefined": true
    }]
  ]
}
```

```js
import { UNDEFINED_VAR } from '@env'

console.log(UNDEFINED_VAR === undefined) // true
```

When set to `false`, an error will be thrown.

</details>
<details><summary><code>verbose</code> (default: <code>false</code>)</summary><br>

Print the active dotenv mode while transforming.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "verbose": true
    }]
  ]
}
```

</details>
<details><summary>process.env</summary><br>

You can also use `process.env` — the plugin inlines matching keys at build time the same way.

```js
console.log(`Hello ${process.env.HELLO}`)
fetch(`${process.env.API_URL}/users`)
```

</details>
<details><summary>Expo</summary><br>

Expo now has [built-in environment variable support](https://docs.expo.dev/guides/environment-variables/). Evaluate if you still need this plugin.

Preview [the expo test app](https://github.com/goatandsheep/react-native-dotenv-expo-test).

</details>
<details><summary>Multi-env</summary><br>

This package now supports environment specific variables. This means you may now import environment variables from multiple files, i.e. `.env`, `.env.development`, `.env.production`, and `.env.test`. This is based on [dotenv-flow](https://www.npmjs.com/package/dotenv-flow).

Note: it is not recommended that you commit any sensitive information in `.env` file to code in case your git repo is exposed. The best practice is to put a `.env.template` or `.env.development.template` that contains dummy values so other developers know what to configure. Then add your `.env` and `.env.development` to `.gitignore`. You can also keep sensitive keys in a separate `.env.local` (and respective `.env.local.template`) in `.gitignore` and you can use your other `.env` files for non-sensitive config.

If you are publishing your apps on an auto-publishing platform like EAS (Expo Application Services), make sure to put your secrets on the platform dashboard directly. If you are wondering what environment the platforms choose it is likely `.env.production` (not `.env.prod`) and there is likely no way to change this.

The base set of variables will be `.env` and the environment-specific variables will overwrite them.

The variables will automatically be pulled from the appropriate environment and `development` is the default. The choice of environment is based on your Babel environment first and if that value is not set, your NPM environment, which should actually be the same, but this makes it more robust.

In general, **Release** is `production` and **Debug** is `development`.

To choose, setup your scripts with `NODE_ENV` for each environment

```json
// package.json
{
  "scripts": {
    "start:development": "NODE_ENV=development npx react-native start",
    "start:production": "NODE_ENV=production npx react-native start"
  }
}
```

</details>
<details><summary>TypeScript</summary><br>

Prefer [Zod](https://zod.dev) to validate your env and infer types — no hand-written `env.d.ts` needed.

```ts
import { z } from 'zod'

export const env = z.object({
  HELLO: z.string().min(1),
  API_URL: z.string().url()
}).parse({
  HELLO: process.env.HELLO,
  API_URL: process.env.API_URL
})

console.log(`Hello ${env.HELLO}`)
fetch(`${env.API_URL}/users`)
```

`env` is fully typed from the schema. If a value is missing or invalid, Zod throws at startup instead of failing later in production.

</details>
<details><summary>Reference Material</summary><br>

If you are not familiar with how dotenv or Babel work, make sure to read the following reference materials:

* [babel environments](https://babeljs.io/docs/en/6.26.3/babelrc#env-option)
* [dotenv documentation](https://www.npmjs.com/package/dotenv)
* [See the wiki for more troubleshooting tips](https://github.com/goatandsheep/react-native-dotenv/wiki/Multi-env-troubleshooting)

### How this works

This Babel plugin processes your `.env` files and your environment variables and replaces the references to the environment variables in your code before it runs. This is because the environment variables will no longer be accessible once the React Native engine generates the app outputs.

</details>
<details><summary>Caching</summary><br>

When using with [`babel-loader`](https://github.com/babel/babel-loader) with caching enabled you will run into issues where environment changes won’t be picked up.
This is due to the fact that `babel-loader` computes a `cacheIdentifier` that does not take your `.env` file(s) into account. The good news is that a recent update has fixed this problem as long as you're using a new version of Babel. Many react native libraries have not updated their Babel version yet so to force the version, add in your `package.json`:

```json
"resolutions": {
  "@babel/core": "^7.20.2",
  "babel-loader": "^8.3.0"
}
```

If this does not work, you should set `api.cache(false)` in your babel config, which resets Babel cache.

If you're using android, add a clean task to your run command: `react-native run-android --tasks clean,installDebug`

metro.config.js`resetCache: true`

You can easily clear the cache:

```shell
rm -rf node_modules/.cache/babel-loader/*
```

or reset all caches

`npm start -- --reset-cache`

or

`yarn start --reset-cache`

or

`yarn start --clear`

or

`jest --no-cache`

or

`expo r -c`

and

`expo start --clear`

or

`react-native clean`

or

`rm -rf .expo/web/cache`

or

[react-native-clean-project](https://www.npmjs.com/package/react-native-clean-project)

Maybe a solution for updating package.json scripts:

>     "cc": "rimraf node_modules/.cache/babel-loader/*,",
>     "android": "npm run cc && react-native run-android",
>     "ios": "npm run cc && react-native run-ios",

Or you can override the default `cacheIdentifier` to include some of your environment variables.

The tests that use `require('@env')` are also not passing.

For nextjs, you _must_ set `moduleName` to `react-native-dotenv`.

</details>
