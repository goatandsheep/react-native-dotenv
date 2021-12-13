const {transformFileSync} = require('@babel/core')

const FIXTURES = '__tests__/__fixtures__/'

describe('react-native-dotenv', () => {
  const OLD_ENV = process.env
  afterEach(() => {
    jest.resetModules()
    process.env = {...OLD_ENV}
  })

  it('should throw if the variable does not exist', () => {
    expect(
      () => transformFileSync(FIXTURES + 'variable-not-exist/source.js'),
    ).toThrow('"foo" is not defined in .env')
  })

  it('should throw if default is imported', () => {
    expect(
      () => transformFileSync(FIXTURES + 'default-import/source.js'),
    ).toThrow('Default import is not supported')
  })

  it('should throw if wildcard is imported', () => {
    expect(
      () => transformFileSync(FIXTURES + 'wildcard-import/source.js'),
    ).toThrow('Wildcard import is not supported')
  })

  it('should load environment variables from .env', () => {
    const {code} = transformFileSync(FIXTURES + 'default/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should print the environment if setting to verbose', () => {
    console.log = jest.fn()
    const {code} = transformFileSync(FIXTURES + 'verbose/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
    expect(console.log.mock.calls[0][1]).toBe('test')
  })

  it('should allow importing variables already defined in the environment', () => {
    process.env.FROM_ENV = 'hello'

    const {code} = transformFileSync(FIXTURES + 'from-env/source.js')
    expect(code).toBe('console.log("hello");')
  })

  it('should prioritize environment variables over variables defined in .env', () => {
    process.env.API_KEY = 'i win'

    const {code} = transformFileSync(FIXTURES + 'default/source.js')
    expect(code).toBe('console.log("i win");\nconsole.log("username");')
  })

  it('should load custom env file', () => {
    const {code} = transformFileSync(FIXTURES + 'filename/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should load multiple env files', () => {
    const {code} = transformFileSync(FIXTURES + 'multi-env/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should load local env files', () => {
    const {code} = transformFileSync(FIXTURES + 'local-env/source.js')
    expect(code).toBe('console.log("username123456");\nconsole.log("local-key");')
  })

  it('should support `as alias` import syntax', () => {
    const {code} = transformFileSync(FIXTURES + 'as-alias/source.js')
    expect(code).toBe('const a = "abc123";\nconst b = "username";')
  })

  it('should allow specifying a custom module name', () => {
    const {code} = transformFileSync(FIXTURES + 'custom-module/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should allow specifying process.env', () => {
    const {code} = transformFileSync(FIXTURES + 'process-env/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");\nconsole.log("test");')
  })

  it('should allow specifying the package module name', () => {
    const {code} = transformFileSync(FIXTURES + 'module-name/source.js')
    expect(code).toBe('// eslint-disable-next-line import/no-unresolved\nconsole.log("abc123");\nconsole.log("username");')
  })

  it('should leave other imports untouched', () => {
    const {code} = transformFileSync(FIXTURES + 'unused/source.js')
    expect(code).toBe('import { join } from \'node:path\'; // eslint-disable-line import/no-unresolved\n\nconsole.log(join);')
  })

  it('should throw when using non-allowlisted env variables', () => {
    expect(
      () => transformFileSync(FIXTURES + 'allowlist/source.js'),
    ).toThrow('"NOT_ALLOWLISTED" was not present in allowlist')
  })

  it('should throw when using blocklisted env variables', () => {
    expect(
      () => transformFileSync(FIXTURES + 'blocklist/source.js'),
    ).toThrow('"BLOCKLISTED" was not present in blocklist')
  })

  it('should throw when using non-whitelisted env variables', () => {
    expect(
      () => transformFileSync(FIXTURES + 'whitelist/source.js'),
    ).toThrow('"NOT_WHITELISTED" was not whitelisted')
  })

  it('should throw when using blacklisted env variables', () => {
    expect(
      () => transformFileSync(FIXTURES + 'blacklist/source.js'),
    ).toThrow('"BLACKLISTED" was blacklisted')
  })

  it('should throw when trying to use a variable not defined in .env in safe mode', () => {
    process.env.FROM_ENV = 'here'

    expect(
      () => transformFileSync(FIXTURES + 'safe-error/source.js'),
    ).toThrow('"FROM_ENV" is not defined')
  })

  it('should load environment variables from .env in safe mode', () => {
    const {code} = transformFileSync(FIXTURES + 'safe-success/source.js')
    expect(code).toBe('console.log("1");\nconsole.log("test");')
  })

  it('should import undefined variables', () => {
    const {code} = transformFileSync(FIXTURES + 'undefined/source.js')
    expect(code).toBe('console.log(undefined);')
  })

  it('should not throw if .env exists in safe mode', () => {
    const {code} = transformFileSync(FIXTURES + 'safe-no-dotenv/source.js')
    expect(code).toBe('console.log(undefined);')
  })

  it('should load APP_ENV specific env file', () => {
    process.env.APP_ENV = 'cli'

    const {code} = transformFileSync(FIXTURES + 'app-env/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should load MY_ENV specific env file', () => {
    process.env.MY_ENV = 'cli'

    const {code} = transformFileSync(FIXTURES + 'env-name/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })
})
