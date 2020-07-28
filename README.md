# react-native-dotenv [![CircleCI](https://circleci.com/gh/goatandsheep/react-native-dotenv.svg?style=svg)](https://circleci.com/gh/goatandsheep/react-native-dotenv)

> Load environment variables using `import` statements.

[![npm version](https://badgen.net/npm/v/react-native-dotenv)](https://www.npmjs.com/package/react-native-dotenv)
[![dependencies Status](https://badgen.net/david/dep/goatandsheep/react-native-dotenv)](https://david-dm.org/goatandsheep/react-native-dotenv)
[![codecov](https://badgen.net/codecov/c/github/goatandsheep/react-native-dotenv)](https://codecov.io/gh/goatandsheep/react-native-dotenv)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo)

## Installation

```sh
$ npm install react-native-dotenv
```

## The story

To those who want to learn why this repo has changed tremendously over the past
couple weeks, this is my explanation to you from @goatandsheep . To everyone
else, continue to [the usage section](#Usage).

[Credits](#Credits).

This package was originally written and maintained by @zetachang . However, due
to intense time commitments, he was unable to keep up with looming security
issues, feature requests, pull requests, etc. Being the smart person he is, he
is in high demand.

We noticed this was an issue and looked around at the various forks the
community had made to solve some of these issues, but there needed to be a
cohesive community. Initially we tried to figure out how to resolve this within
@zetachang 's repo, but we realized he likely wouldn't be able to keep up.

When we started thinking about a plan of how to upgrade it we realized there
would be too many necessary changes than it would be worth to upgrade it
piecewise so we took @tusbar 's fork, which is called
[babel-plugin-dotenv-import](https://github.com/tusbar/babel-plugin-dotenv-import).
His fork is really good, which is why we wanted to build off that.

We've added a few features and are going to continue to add more as the
community requests it.

If you'd like to become a contributor, please send me a message and I'd be
happy to add you to the team. There is also a [gitter chat](https://gitter.im/pass-it-on/react-native-dotenv#)
and I'll try to answer any notifications I get.

## Migration

For those moving from v0.2.0 to the latest version, you will find it is quite
the jump. We are working on a migration guide. For now, take a look at the
issues tab at #15 and #18 .

## Usage

**.babelrc**

```json
{
  "plugins": [
    ["module:react-native-dotenv", {
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

When `false` (default behavior), an error will be thrown.

## Caveats

When using with [`babel-loader`](https://github.com/babel/babel-loader) with caching enabled you will run into issues where environment changes won’t be picked up.
This is due to the fact that `babel-loader` computes a `cacheIdentifier` that does not take your environment into account.

You can easily clear the cache:

```shell
rm -rf node_modules/.cache/babel-loader/*
```

Or you can override the default `cacheIdentifier` to include some of your environment variables.

Multi-environment is still a work in progress.

## Credits

* Based on [David Chang](https://github.com/zetachang)’s works on [babel-plugin-dotenv](https://github.com/zetachang/react-native-dotenv/tree/master/babel-plugin-dotenv).
* Also based on [Bertrand Marron](https://github.com/tusbar)'s works on [babel-plugin-dotenv-import](https://github.com/tusbar/babel-plugin-dotenv-import).

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
