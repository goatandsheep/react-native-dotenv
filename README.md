# react-native-dotenv [![CircleCI](https://circleci.com/gh/goatandsheep/react-native-dotenv.svg?style=svg)](https://circleci.com/gh/goatandsheep/react-native-dotenv)

> Load environment variables using `import` statements.

[![npm version](https://badgen.net/npm/v/react-native-dotenv)](https://www.npmjs.com/package/react-native-dotenv)
[![dependencies Status](https://badgen.net/david/dep/goatandsheep/react-native-dotenv)](https://david-dm.org/goatandsheep/react-native-dotenv)
[![codecov](https://badgen.net/codecov/c/github/goatandsheep/react-native-dotenv)](https://codecov.io/gh/goatandsheep/react-native-dotenv)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo) [![Join the chat at https://gitter.im/pass-it-on/react-native-dotenv](https://badges.gitter.im/pass-it-on/react-native-dotenv.svg)](https://gitter.im/pass-it-on/react-native-dotenv?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm downloads](https://img.shields.io/npm/dt/react-native-dotenv.svg?style=flat-square)](https://www.npmjs.com/package/react-native-dotenv)

## Installation

```sh
$ npm install react-native-dotenv
```

**Breaking changes**: moving from `v0.x` to `v2.x` changes both the setup and usage of this package. Please see the [migration guide](https://github.com/goatandsheep/react-native-dotenv/wiki/Migration-Guide).

Many have been asking about the reasons behind recent changes in this repo. Please see the [story wiki page](https://github.com/goatandsheep/react-native-dotenv/wiki/Story-of-this-repo).

## Introduction

This babel plugin lets you inject your environment variables into your react-native environment using dotenv for multiple environments.

## Usage

**.babelrc**

Basic setup:

```json
{
  "plugins": [
    ["module:react-native-dotenv"]
  ]
}
```

If the defaults do not cut it for your project, this outlines the available options for your Babel configuration and their respective default values, but you do not need to add them if you are using the default settings.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": ".env",
      "blacklist": null,
      "whitelist": null,
      "safe": false,
      "allowUndefined": true
    }]
  ]
}
```

Note: for safe mode, it's highly recommended to set `allowUndefined` to `false`.

**.env**

```dosini
API_URL=https://api.example.org
API_TOKEN=abc123
```

In **users.js**

```js
import {API_URL, API_TOKEN} from "@env"

fetch(`${API_URL}/users`, {
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`
  }
})
```

## White and black lists

It is possible to limit the scope of env variables that will be imported by specifying a `whitelist` and/or a `blacklist` as an array of strings.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "blacklist": [
        "GITHUB_TOKEN"
      ]
    }]
  ]
}
```

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "whitelist": [
        "API_URL",
        "API_TOKEN"
      ]
    }]
  ]
}
```

## Safe mode

Enable safe mode to only allow environment variables defined in the `.env` file. This will completely ignore everything that is already defined in the environment.

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

## Allow undefined

Allow importing undefined variables, their value will be `undefined`.

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
import {UNDEFINED_VAR} from '@env'

console.log(UNDEFINED_VAR === undefined) // true
```

When set to `false`, an error will be thrown. **This is no longer default behavior**.

## Multi-env

This package now supports environment specific variables. This means you may now import environment variables from multiple files, i.e. `.env`, `.env.development`, `.env.production`, and `.env.test`.

Note: it is not recommended that you commit any sensitive information in `.env` file to code in case your git repo is exposed. The best practice is to put a `.env.template` or `.env.development.template` that contains dummy values so other developers know what to configure. Then add your `.env` and `.env.development` to `.gitignore`. In a future release you can keep sensitive keys in a separate `.env.local` (and respective `.env.local.template`) in `.gitignore` and you can use your other `.env` files for non-sensitive config.

The base set of variables will be `.env` and the environment-specific variables will overwrite them.

The variables will automatically be pulled from the appropriate environment and `development` is the default. The choice of environment is based on your Babel environment first and if that value is not set, your NPM environment, which should actually be the same, but this makes it more robust.

In general, **Release** is `production` and **Debug** is `development`.
## Experimental feature
One thing that we've noticed is that metro overwrites the test environment variable even if you specify a config so we've added a way to fix this. Make sure to specify the config value as indicated in the wiki and make custom configs for alternative builds. However, if you still need this, such as for a staging / test environment, you can add the APP_ENV environment variable in the CLI. For example:

```json
// package.json
{
  "scripts": {
    "start:staging": "APP_ENV=staging npx react-native start",
  }
}
```
The above example would use the `.env.staging` file. The standard word is `test`, but go nuts.

## TypeScript

- Create a `types` folder in your project
- Inside that folder, create a `*.d.ts`file, say, `env.d.ts`
- in that file, declare a module as the following format:
```ts
declare module '@env' {
  export const API_BASE: string;
}
```
Add all of your .env variables inside this module.

- Finally, add this folder into the `typeRoots` field in your `tsconfig.json` file:
```json
{
...
    "typeRoots": ["./src/types"],
...
}
```

## Reference Material

* [babel environments](https://babeljs.io/docs/en/6.26.3/babelrc#env-option)
* [dotenv documentation](https://www.npmjs.com/package/dotenv)
* [See the wiki for more troubleshooting tips](https://github.com/goatandsheep/react-native-dotenv/wiki/Multi-env-troubleshooting)

## Caveats

When using with [`babel-loader`](https://github.com/babel/babel-loader) with caching enabled you will run into issues where environment changes won’t be picked up.
This is due to the fact that `babel-loader` computes a `cacheIdentifier` that does not take your environment into account.

You can easily clear the cache:

```shell
rm -rf node_modules/.cache/babel-loader/*
```

or

`yarn start --reset-cache`

or

`expo r -c`

Maybe a solution for updating package.json scripts:

>     "cc": "rimraf node_modules/.cache/babel-loader/*,",
>     "android": "npm run cc && react-native run-android",
>     "ios": "npm run cc && react-native run-ios",

Or you can override the default `cacheIdentifier` to include some of your environment variables.

The tests that use `require('@env')` are also not passing.

## Credits

* Based on [David Chang](https://github.com/zetachang)’s works on [babel-plugin-dotenv](https://github.com/zetachang/react-native-dotenv/tree/master/babel-plugin-dotenv).
* Also based on [Bertrand Marron](https://github.com/tusbar)'s works on [babel-plugin-dotenv-import](https://github.com/tusbar/babel-plugin-dotenv-import).

If you'd like to become an active contributor, please send us a message.

## Miscellaneous

```
    ╚⊙ ⊙╝
  ╚═(███)═╝
 ╚═(███)═╝
╚═(███)═╝
 ╚═(███)═╝
  ╚═(███)═╝
   ╚═(███)═╝
```
