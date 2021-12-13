const {readFileSync} = require('fs')
const dotenv = require('dotenv')

function parseDotenvFile(path, verbose = false) {
  let content

  try {
    content = readFileSync(path)
  } catch (error) {
    // The env file does not exist.
    if (verbose) {
      console.error('react-native-dotenv', error)
    }

    return {}
  }

  return dotenv.parse(content)
}

module.exports = ({types: t}) => ({
  name: 'dotenv-import',

  pre() {
    this.opts = {
      envName: 'APP_ENV',
      moduleName: '@env',
      path: '.env',
      whitelist: null,
      blacklist: null,
      allowlist: null,
      blocklist: null,
      safe: false,
      allowUndefined: true,
      verbose: false,
      ...this.opts,
    }

    const babelMode = process.env[this.opts.envName] || (process.env.BABEL_ENV && process.env.BABEL_ENV !== 'undefined' && process.env.BABEL_ENV !== 'development' && process.env.BABEL_ENV) || process.env.NODE_ENV || 'development'
    if (this.opts.verbose) {
      console.log('dotenvMode', babelMode)
    }

    if (this.opts.safe) {
      const parsed = parseDotenvFile(this.opts.path, this.opts.verbose)
      const localParsed = parseDotenvFile(this.opts.path + '.local')
      const modeParsed = parseDotenvFile(this.opts.path + '.' + babelMode)
      const modeLocalParsed = parseDotenvFile(this.opts.path + '.' + babelMode + '.local')
      this.env = Object.assign(Object.assign(Object.assign(parsed, modeParsed), localParsed), modeLocalParsed)
      this.env.NODE_ENV = process.env.NODE_ENV || babelMode
    } else {
      dotenv.config({
        path: this.opts.path + '.' + babelMode + '.local',
        silent: true,
      })
      dotenv.config({
        path: this.opts.path + '.' + babelMode,
        silent: true,
      })
      dotenv.config({
        path: this.opts.path + '.local',
        silent: true,
      })
      dotenv.config({
        path: this.opts.path,
      })
      this.env = process.env
    }
  },

  visitor: {
    ImportDeclaration(path, {opts}) {
      if (path.node.source.value === opts.moduleName) {
        for (const [idx, specifier] of path.node.specifiers.entries()) {
          if (specifier.type === 'ImportDefaultSpecifier') {
            throw path.get('specifiers')[idx].buildCodeFrameError('Default import is not supported')
          }

          if (specifier.type === 'ImportNamespaceSpecifier') {
            throw path.get('specifiers')[idx].buildCodeFrameError('Wildcard import is not supported')
          }

          if (specifier.imported && specifier.local) {
            const importedId = specifier.imported.name
            const localId = specifier.local.name

            if (Array.isArray(opts.allowlist) && !opts.allowlist.includes(importedId)) {
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was not present in allowlist`)
            } else if (Array.isArray(opts.whitelist) && !opts.whitelist.includes(importedId)) {
              console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use allowlist instead')
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was not whitelisted`)
            }

            if (Array.isArray(opts.blocklist) && opts.blocklist.includes(importedId)) {
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was not present in blocklist`)
            } else if (Array.isArray(opts.blacklist) && opts.blacklist.includes(importedId)) {
              console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use blocklist instead')
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was blacklisted`)
            }

            if (!opts.allowUndefined && !Object.prototype.hasOwnProperty.call(this.env, importedId)) {
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" is not defined in ${opts.path}`)
            }

            const binding = path.scope.getBinding(localId)
            for (const refPath of binding.referencePaths) {
              refPath.replaceWith(t.valueToNode(this.env[importedId]))
            }
          }
        }

        path.remove()
      }
    },
    MemberExpression(path, {opts}) {
      if (path.get('object').matchesPattern('process.env')) {
        const key = path.toComputedKey()
        if (t.isStringLiteral(key)) {
          const importedId = key.value
          const value = (opts.env && importedId in opts.env) ? opts.env[importedId] : process.env[importedId]

          path.replaceWith(t.valueToNode(value))
        }
      }
    },
  },
})
