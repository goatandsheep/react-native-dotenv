const babel = require('babel-core')
const expect = require('expect.js')

describe('babel-plugin-dotenv-import', () => {
  before(() => {
    this.env = {...process.env}
  })

  afterEach(() => {
    process.env = {...this.env}
  })

  it('should throw if variable not exist', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/variable-not-exist/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('"foo" is not defined in .env')
    })
  })

  it('should throw if default is imported', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/default-import/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('Default import is not supported')
    })
  })

  it('should throw if wildcard is imported', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/wildcard-import/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('Wildcard import is not supported')
    })
  })

  it('should load default env from .env', () => {
    const result = babel.transformFileSync('test/fixtures/default/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
  })

  it('should allow importing variables defined in the environment', () => {
    process.env.FROM_ENV = 'hello'
    const result = babel.transformFileSync('test/fixtures/from-env/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'hello\');')
  })

  it('should keep existing environment variables', () => {
    process.env.API_KEY = 'dont override me'

    const result = babel.transformFileSync('test/fixtures/default/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'dont override me\');\nconsole.log(\'username\');')
  })

  it('should load custom env file ".env.build"', () => {
    const result = babel.transformFileSync('test/fixtures/filename/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123456\');\nconsole.log(\'username123456\');')
  })

  it('should support `as alias` import syntax', () => {
    const result = babel.transformFileSync('test/fixtures/as-alias/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconst a = \'abc123\';\nconst b = \'username\';')
  })

  it('should allow specifying a custom module name', () => {
    const result = babel.transformFileSync('test/fixtures/custom-module/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'abc123\');\nconsole.log(\'username\');')
  })

  it('should not alter other imports', () => {
    const result = babel.transformFileSync('test/fixtures/unused/source.js')
    expect(result.code).to.be('\'use strict\';\n\nvar _path = require(\'path\');\n\nconsole.log(_path.join);')
  })

  it('should throw when using non-whitelisted env variables', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/whitelist/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('"NOT_WHITELISTED" was not whitelisted')
    })
  })

  it('should throw when using blacklisted env variables', () => {
    expect(() => {
      babel.transformFileSync('test/fixtures/blacklist/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('"BLACKLISTED" was blacklisted')
    })
  })

  it('should throw trying to use a variable not in .env in safe mode', () => {
    expect(() => {
      process.env.FROM_ENV = 'here'
      babel.transformFileSync('test/fixtures/safe-error/source.js')
    }).to.throwException(e => {
      expect(e.message).to.contain('"FROM_ENV" is not defined in test/fixtures/safe-error/.env')
    })
  })

  it('should retrieve environment variables from .env in safe mode', () => {
    const result = babel.transformFileSync('test/fixtures/safe-success/source.js')
    expect(result.code).to.be('\'use strict\';\n\nconsole.log(\'1\');')
  })
})
