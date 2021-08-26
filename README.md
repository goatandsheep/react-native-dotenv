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
      "envName": "APP_ENV",
      "moduleName": "@env",
      "path": ".env",
      "blocklist": null,
      "allowlist": null,
      "blacklist": null, // DEPRECATED
      "whitelist": null, // DEPRECATED
      "safe": false,
      "allowUndefined": true,
      "verbose": false
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

Also preview [the upcoming test app](https://github.com/goatandsheep/chatkitty-example-react-native/).

## [DEPRECATED] White and black lists

Moving forward to a more inclusive language, terms like `white` and `black` are being moved away. Future versions will just use `allowlist` and `blocklist` while `whitelist`/`blacklist` are still supported.

## Allow and Block lists

It is possible to limit the scope of env variables that will be imported by specifying a `allowlist` and/or a `blocklist` as an array of strings.

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

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "allowlist": [
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

## Override `envName`

One thing that we've noticed is that metro overwrites the test environment variable even if you specify a config, so we've added a way to fix this. By default, defining the `APP_ENV` variable can be used to set your preferred environment, separate from `NODE_ENV`.

```json
// package.json
{
  "scripts": {
    "start:staging": "APP_ENV=staging npx react-native start",
  }
}
```
The above example would use the `.env.staging` file. The standard word is `test`, but go nuts.

To use your own defined name as the environment override, you can define it using `envName`:

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
     "envName": "MY_ENV"
    }]
  ]
}
```

Now you can define `MY_ENV`:

```json
// package.json
{
  "scripts": {
    "start:staging": "MY_ENV=staging npx react-native start",
  }
}
```

Note: if you're using `APP_ENV` (or `envName`), you should avoid using `development` nor `production` as values, and you should avoid having a `.env.development` or `.env.production`. This is a Babel and Node thing that I have little control over unfortunately and is consistent with many other platforms that have an override option, like [Gatsby](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#additional-environments-staging-test-etc). If you want to use `development` and `production`, you should not use `APP_ENV` (or `envName`), but rather the built-in `NODE_ENV=development` or `NODE_ENV=production`.


## Multi-env

This package now supports environment specific variables. This means you may now import environment variables from multiple files, i.e. `.env`, `.env.development`, `.env.production`, and `.env.test`. This is based on [dotenv-flow](https://www.npmjs.com/package/dotenv-flow).

Note: it is not recommended that you commit any sensitive information in `.env` file to code in case your git repo is exposed. The best practice is to put a `.env.template` or `.env.development.template` that contains dummy values so other developers know what to configure. Then add your `.env` and `.env.development` to `.gitignore`. You can also keep sensitive keys in a separate `.env.local` (and respective `.env.local.template`) in `.gitignore` and you can use your other `.env` files for non-sensitive config.

The base set of variables will be `.env` and the environment-specific variables will overwrite them.

The variables will automatically be pulled from the appropriate environment and `development` is the default. The choice of environment is based on your Babel environment first and if that value is not set, your NPM environment, which should actually be the same, but this makes it more robust.

In general, **Release** is `production` and **Debug** is `development`.

To choose, setup your scripts with `NODE_ENV` for each environment

```json
// package.json
{
  "scripts": {
    "start:development": "NODE_ENV=development npx react-native start",
    "start:production": "NODE_ENV=production npx react-native start",
  }
}
```

## TypeScript

### Option 1: easy mode

Install the @types package [![npm version](https://badgen.net/npm/v/@types/react-native-dotenv)](https://www.npmjs.com/package/@types/react-native-dotenv)

```shell
npm install @types/react-native-dotenv
```

Set the `moduleName` in your Babel config as `react-native-dotenv`.

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
      "moduleName": "react-native-dotenv"
    }]
  ]
}
```

Import your variables from `react-native-dotenv`:

```js
import {API_URL} from 'react-native-dotenv'

console.log(API_URL)
```

### Option 2: specify types manually

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

or

[react-native-clean-project](https://www.npmjs.com/package/react-native-clean-project)

Maybe a solution for updating package.json scripts:

>     "cc": "rimraf node_modules/.cache/babel-loader/*,",
>     "android": "npm run cc && react-native run-android",
>     "ios": "npm run cc && react-native run-ios",

Or you can override the default `cacheIdentifier` to include some of your environment variables.

The tests that use `require('@env')` are also not passing.

For nextjs, you _must_ set `moduleName` to `react-native-dotenv`.

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
