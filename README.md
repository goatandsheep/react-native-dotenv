# babel-plugin-dotenv-import [![CircleCI](https://circleci.com/gh/tusbar/babel-plugin-dotenv-import.svg?style=svg)](https://circleci.com/gh/tusbar/babel-plugin-dotenv-import)

[![npm version](https://img.shields.io/npm/v/babel-plugin-dotenv-import.svg)](https://www.npmjs.com/package/babel-plugin-dotenv-import)
[![codecov](https://codecov.io/gh/tusbar/babel-plugin-dotenv-import/branch/master/graph/badge.svg)](https://codecov.io/gh/tusbar/babel-plugin-dotenv-import)
[![dependencies Status](https://david-dm.org/tusbar/babel-plugin-dotenv-import/status.svg)](https://david-dm.org/tusbar/babel-plugin-dotenv-import)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Load environment variables from .env file using `import` statement.

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
      "whitelist": null
    }]
  ]
}
```

**.env**

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
```

In **whatever.js**

```js
import {DB_HOST, DB_USER, DB_PASS} from "@env"

db.connect({
  host: DB_HOST,
  username: DB_USER,
  password: DB_PASS
});
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

## Credits

Based on [David Chang](https://github.com/zetachang)’s works on [babel-plugin-dotenv](https://github.com/zetachang/react-native-dotenv/tree/master/babel-plugin-dotenv).
