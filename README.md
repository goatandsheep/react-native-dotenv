# babel-plugin-dotenv-import [![CircleCI](https://circleci.com/gh/tusbar/babel-plugin-dotenv-import.svg?style=svg)](https://circleci.com/gh/tusbar/babel-plugin-dotenv-import)

> Load environment variables using `import` statements.

[![npm version](https://badgen.net/npm/v/babel-plugin-dotenv-import)](https://www.npmjs.com/package/babel-plugin-dotenv-import)
[![dependencies Status](https://badgen.net/david/dep/tusbar/babel-plugin-dotenv-import)](https://david-dm.org/tusbar/babel-plugin-dotenv-import)
[![codecov](https://badgen.net/codecov/c/github/tusbar/babel-plugin-dotenv-import)](https://codecov.io/gh/tusbar/babel-plugin-dotenv-import)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo)

## Installation

```sh
$ npm install babel-plugin-dotenv-import
```

## Usage

**.babelrc**

```json
{
  "plugins": [
    ["dotenv-import", {
      "moduleName": "@env",
      "path": ".env",
      "blacklist": null,
      "whitelist": null,
      "safe": false,
      "allowUndefined": false
    }]
  ]
}
```

**.env**

```dosini
API_URL=https://api.example.org
API_TOKEN=
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
    ["dotenv-import", {
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
    ["dotenv-import", {
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
    ["dotenv-import", {
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
    ["dotenv-import", {
      "allowUndefined": true
    }]
  ]
}
```

```js
import {UNDEFINED_VAR} from '@env'

console.log(UNDEFINED_VAR === undefined) // true
```

When `false` (default behavior), an error will be thrown.

## Caveats

When using with [`babel-loader`](https://github.com/babel/babel-loader) with caching enabled you will run into issues where environment changes won’t be picked up.
This is due to the fact that `babel-loader` computes a `cacheIdentifier` that does not take your environment into account.

You can easily clear the cache:

```shell
rm -rf node_modules/.cache/babel-loader/*
```

Or you can override the default `cacheIdentifier` to include some of your environment variables.

## Credits

Based on [David Chang](https://github.com/zetachang)’s works on [babel-plugin-dotenv](https://github.com/zetachang/react-native-dotenv/tree/master/babel-plugin-dotenv).

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
