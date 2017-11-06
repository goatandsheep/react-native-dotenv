import test from 'ava'
import {transformFileSync} from 'babel-core'

const env = Object.apply({}, process.env)

test.afterEach(() => {
  process.env = Object.apply({}, env)
})

test('throw if the variable does not exist', t => {
  t.throws(
    () => transformFileSync('test/fixtures/variable-not-exist/source.js'),
    'test/fixtures/variable-not-exist/source.js: "foo" is not defined in .env'
  )
})

test('throw if default is imported', t => {
  t.throws(
    () => transformFileSync('test/fixtures/default-import/source.js'),
    'test/fixtures/default-import/source.js: Default import is not supported'
  )
})

test('throw if wildcard is imported', t => {
  t.throws(
    () => transformFileSync('test/fixtures/wildcard-import/source.js'),
    'test/fixtures/wildcard-import/source.js: Wildcard import is not supported'
  )
})

test('load environment variables from .env', t => {
  const {code} = transformFileSync('test/fixtures/default/source.js')
  t.is(code, '\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
})

test('allow importing variables already defined in the environment', t => {
  process.env.FROM_ENV = 'hello'

  const {code} = transformFileSync('test/fixtures/from-env/source.js')
  t.is(code, '\n\nconsole.log(\'hello\');')
})

test('prioritize environment variables over variables defined in .env', t => {
  process.env.API_KEY = 'i win'

  const {code} = transformFileSync('test/fixtures/default/source.js')
  t.is(code, '\n\nconsole.log(\'i win\');\nconsole.log(\'username\');')
})

test('load custom env file', t => {
  const {code} = transformFileSync('test/fixtures/filename/source.js')
  t.is(code, '\n\nconsole.log(\'abc123456\');\nconsole.log(\'username123456\');')
})

test('support `as alias` import syntax', t => {
  const {code} = transformFileSync('test/fixtures/as-alias/source.js')
  t.is(code, '\n\nconst a = \'abc123\';\nconst b = \'username\';')
})

test('allow specifying a custom module name', t => {
  const {code} = transformFileSync('test/fixtures/custom-module/source.js')
  t.is(code, '\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
})

test('leave other imports untouched', t => {
  const {code} = transformFileSync('test/fixtures/unused/source.js')
  t.is(code, 'import { join } from \'path\';\n\nconsole.log(join);')
})

test('throw when using non-whitelisted env variables', t => {
  t.throws(
    () => transformFileSync('test/fixtures/whitelist/source.js'),
    'test/fixtures/whitelist/source.js: "NOT_WHITELISTED" was not whitelisted'
  )
})

test('throw when using blacklisted env variables', t => {
  t.throws(
    () => transformFileSync('test/fixtures/blacklist/source.js'),
    'test/fixtures/blacklist/source.js: "BLACKLISTED" was blacklisted'
  )
})

test('throw when trying to use a variable not defined in .env in safe mode', t => {
  process.env.FROM_ENV = 'here'

  t.throws(
    () => transformFileSync('test/fixtures/safe-error/source.js'),
    'test/fixtures/safe-error/source.js: "FROM_ENV" is not defined in test/fixtures/safe-error/.env'
  )
})

test('load environment variables from .env in safe mode', t => {
  const {code} = transformFileSync('test/fixtures/safe-success/source.js')
  t.is(code, '\n\nconsole.log(\'1\');')
})

test('import undefined variables', t => {
  const {code} = transformFileSync('test/fixtures/undefined/source.js')
  t.is(code, '\n\nconsole.log(undefined);')
})
