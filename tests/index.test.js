const { transformFileSync, transformSync } = require('@babel/core')

const FIXTURES = 'tests/fixtures/'

describe('react-native-dotenv', () => {
  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'test'
  }

  const OLD_ENV = process.env
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    console.error.mockRestore()
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  it('should throw if the variable does not exist', () => {
    expect(() => transformFileSync(FIXTURES + 'variable-not-exist/source.js')).toThrow('"foo" is not defined in .env')
  })

  it('should throw if default is imported', () => {
    expect(() => transformFileSync(FIXTURES + 'default-import/source.js')).toThrow('Default import is not supported')
  })

  it('should throw if wildcard is imported', () => {
    expect(() => transformFileSync(FIXTURES + 'wildcard-import/source.js')).toThrow('Wildcard import is not supported')
  })

  it('should load environment variables from .env', () => {
    const { code } = transformFileSync(FIXTURES + 'default/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should print the environment if setting to verbose', () => {
    const { code } = transformFileSync(FIXTURES + 'verbose/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
    expect(console.error.mock.calls.some(call => String(call[0]).includes('dotenvMode test'))).toBe(true)
  })

  it('should log injected env to stderr', () => {
    jest.resetModules()
    transformSync('import { API_KEY } from "@env"; console.log(API_KEY)', {
      configFile: false,
      babelrc: false,
      plugins: [[require('../index.js'), { path: FIXTURES + 'default/.env' }]]
    })
    expect(console.error.mock.calls.some(call => /^◇ injected env \(\d+\) from /.test(String(call[0])))).toBe(true)
  })

  it('should not log injected env when quiet', () => {
    jest.resetModules()
    transformSync('import { API_KEY } from "@env"', {
      configFile: false,
      babelrc: false,
      plugins: [[require('../index.js'), { path: FIXTURES + 'default/.env', quiet: true }]]
    })
    expect(console.error.mock.calls.some(call => String(call[0]).includes('injected env'))).toBe(false)
  })

  it('should allow importing variables already defined in the environment', () => {
    process.env.FROM_ENV = 'hello'

    const { code } = transformFileSync(FIXTURES + 'from-env/source.js')
    expect(code).toBe('console.log("hello");')
  })

  /*
    // removed because babel caches process.env if multiple tests using the same fixtures
    it('should prioritize environment variables over variables defined in .env', () => {
      process.env.API_KEY = 'i win'
      const {code} = transformFileSync(FIXTURES + 'default/source.js')
      expect(code).toBe('console.log("i win");\nconsole.log("username");')
    })
  */

  it('should prioritize environment variables over variables defined in .env even when safe', () => {
    process.env.API_KEY = 'i win again'

    const { code } = transformFileSync(FIXTURES + 'default-safe/source.js')
    expect(code).toBe('console.log("i win again");\nconsole.log("username");')
  })

  it('should load custom env file', () => {
    const { code } = transformFileSync(FIXTURES + 'filename/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should load multiple env files', () => {
    const { code } = transformFileSync(FIXTURES + 'multi-env/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should load local env files', () => {
    const { code } = transformFileSync(FIXTURES + 'local-env/source.js')
    expect(code).toBe('console.log("username123456");\nconsole.log("local-key");')
  })

  it('should support `as alias` import syntax', () => {
    const { code } = transformFileSync(FIXTURES + 'as-alias/source.js')
    expect(code).toBe('const a = "abc123";\nconst b = "username";')
  })

  it('should allow specifying a custom module name', () => {
    const { code } = transformFileSync(FIXTURES + 'custom-module/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should allow specifying process.env', () => {
    const { code } = transformFileSync(FIXTURES + 'process-env/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");\nconsole.log("test");')
  })

  it('should not change undefined process.env variables', () => {
    const { code } = transformFileSync(FIXTURES + 'process-env-undefined/source.js')
    expect(code).toBe('console.log(process.env.UNDEFINED_VAR);')
  })

  it('should propagate process.env variables from node process', () => {
    const customEnv = 'my-custom-env'
    const backupNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = customEnv
    const { code } = transformFileSync(FIXTURES + 'process-env-propagate/source.js')
    expect(code).toBe(`console.log("${customEnv}");`)
    process.env.NODE_ENV = backupNodeEnv
  })

  it('should allow specifying the package module name', () => {
    const { code } = transformFileSync(FIXTURES + 'module-name/source.js')
    expect(code).toBe('console.log("abc123");\nconsole.log("username");')
  })

  it('should leave other imports untouched', () => {
    const { code } = transformFileSync(FIXTURES + 'unused/source.js')
    expect(code).toBe('import { join } from \'node:path\';\nconsole.log(join);')
  })

  it('should throw when using non-allowlisted env variables', () => {
    expect(() => transformFileSync(FIXTURES + 'allowlist/source.js')).toThrow('"NOT_ALLOWLISTED" was not present in allowlist')
  })

  it('should throw when using blocklisted env variables', () => {
    expect(() => transformFileSync(FIXTURES + 'blocklist/source.js')).toThrow('"BLOCKLISTED" was not present in blocklist')
  })

  it('should throw when trying to use a variable not defined in .env in safe mode', () => {
    process.env.FROM_ENV = 'here'

    expect(() => transformFileSync(FIXTURES + 'safe-error/source.js')).toThrow('"FROM_ENV" is not defined')
  })

  it('should load environment variables from .env in safe mode', () => {
    const { code } = transformFileSync(FIXTURES + 'safe-success/source.js')
    expect(code).toBe('console.log("1");\nconsole.log("test");')
  })

  it('should import undefined variables', () => {
    const { code } = transformFileSync(FIXTURES + 'undefined/source.js')
    expect(code).toBe('console.log(undefined);')
  })

  it('should not throw if .env exists in safe mode', () => {
    const { code } = transformFileSync(FIXTURES + 'safe-no-dotenv/source.js')
    expect(code).toBe('console.log(undefined);')
  })

  it('should load APP_ENV specific env file', () => {
    process.env.APP_ENV = 'cli'

    const { code } = transformFileSync(FIXTURES + 'app-env/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  it('should fail to load APP_ENV development', () => {
    process.env.APP_ENV = 'development'

    const { code } = transformFileSync(FIXTURES + 'app-env-development/source.js')
    expect(code).toBe('console.log("never");\nconsole.log("this-should-not-appear");')
    expect(console.error.mock.calls.some(call => call[0] === 'APP_ENV error')).toBe(true)
  })

  it('should fail to load APP_ENV production', () => {
    process.env.APP_ENV = 'production'

    const { code } = transformFileSync(FIXTURES + 'app-env-production/source.js')
    expect(code).toBe('console.log("never");\nconsole.log("this-should-not-appear");')
    expect(console.error.mock.calls.some(call => call[0] === 'APP_ENV error')).toBe(true)
  })

  it('should load MY_ENV specific env file', () => {
    process.env.MY_ENV = 'cli'

    const { code } = transformFileSync(FIXTURES + 'env-name/source.js')
    expect(code).toBe('console.log("abc123456");\nconsole.log("username123456");')
  })

  // #574 — process.env.X only inlines keys from .env (no host-only / tooling leaks).
  it('should not inline process.env keys that are absent from .env', () => {
    process.env.JEST_WORKER_ID = '123'
    process.env.MY_CI_VAR = 'from-ci'

    const { code } = transformSync(
      'console.log(process.env.JEST_WORKER_ID);\nconsole.log(process.env.MY_CI_VAR);',
      {
        configFile: false,
        babelrc: false,
        plugins: [[require('../index.js'), { path: FIXTURES + 'default/.env' }]]
      }
    )

    expect(code).toBe('console.log(process.env.JEST_WORKER_ID);\nconsole.log(process.env.MY_CI_VAR);')
  })

  // #501 — Expo Router injects EXPO_ROUTER_* into the Node process; inlining them
  // stomped expo-router's own Babel plugin. Leave host-only Expo keys alone.
  it('should not inline Expo Router host env vars absent from .env', () => {
    process.env.EXPO_ROUTER_APP_ROOT = '/Users/someone/my-app/app'
    process.env.EXPO_ROUTER_ABS_APP_ROOT = '/Users/someone/my-app/app'
    process.env.EXPO_PROJECT_ROOT = '/Users/someone/my-app'

    const { code } = transformSync(
      'console.log(process.env.EXPO_ROUTER_APP_ROOT);\nconsole.log(process.env.EXPO_ROUTER_ABS_APP_ROOT);\nconsole.log(process.env.EXPO_PROJECT_ROOT);\nconsole.log(process.env.API_KEY);',
      {
        configFile: false,
        babelrc: false,
        plugins: [[require('../index.js'), { path: FIXTURES + 'default/.env' }]]
      }
    )

    expect(code).toBe(
      'console.log(process.env.EXPO_ROUTER_APP_ROOT);\nconsole.log(process.env.EXPO_ROUTER_ABS_APP_ROOT);\nconsole.log(process.env.EXPO_PROJECT_ROOT);\nconsole.log("abc123");'
    )
  })

  it('should still allow @env imports from host/CI without the key in .env', () => {
    process.env.MY_CI_VAR = 'from-ci'

    const { code } = transformSync('import { MY_CI_VAR } from "@env";\nconsole.log(MY_CI_VAR);', {
      configFile: false,
      babelrc: false,
      plugins: [[require('../index.js'), { path: FIXTURES + 'default/.env' }]]
    })

    expect(code).toBe('console.log("from-ci");')
  })
})
