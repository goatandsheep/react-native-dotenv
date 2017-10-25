# babel-plugin-dotenv-import

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
      "path": ".env"
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

## Credits

Based on [David Chang](https://github.com/zetachang)’s works on [babel-plugin-dotenv](https://github.com/zetachang/react-native-dotenv/tree/master/babel-plugin-dotenv).
