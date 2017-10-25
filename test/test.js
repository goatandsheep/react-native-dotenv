const babel = require('babel-core')
const expect = require('expect.js')

describe('myself in some tests', () => {
  it('should throw if variable not exist', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/variable-not-exist/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('Try to import dotenv variable "foo" which is not defined in any .env files.')
    })
  })

  it('should throw if default is imported', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/default-imported/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('Import dotenv as default is not supported.')
    })
  })

  it('should load default env from .env', () => {
    const result = babel.transformFileSync('test/fixtures/default/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
  })

  it('should load let .env.development overwrite .env', () => {
    const result = babel.transformFileSync('test/fixtures/dev-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'userdonthavename\');')
  })

  it('should load custom env file "build.env" and its overwrites', () => {
    const result = babel.transformFileSync('test/fixtures/filename/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123456\');\nconsole.log(\'userdonthavename123456\');')
  })

  it('should load let .env.production overwrite .env', () => {
    process.env.BABEL_ENV = 'production'
    const result = babel.transformFileSync('test/fixtures/prod-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'foobar\');')
    process.env.BABEL_ENV = undefined
  })

  it('should support `as alias` import syntax', () => {
    const result = babel.transformFileSync('test/fixtures/as-alias/source.js')
    expect(result.code).to.be('\'use strict\';\n\nvar a = \'abc123\';\nvar b = \'username\';')
  })

  it('should do nothing if no `replacedModuleName` provided', () => {
    const result = babel.transformFileSync('test/fixtures/replaced-module-name-not-provided/source.js')
    expect(result.code).to.be('\'use strict\';\n\nvar _fancyDotenv = require(\'fancy-dotenv\');\n\nvar _fancyDotenv2 = _interopRequireDefault(_fancyDotenv);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }')
  })
})
