const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function parseDotenvFile(filepath, verbose = false) {
  let content

  try {
    content = fs.readFileSync(filepath)
  } catch (error) {
    // The env file does not exist.
    if (verbose) {
      console.error('react-native-dotenv', error)
    }

    return {}
  }

  return dotenv.parse(content) //
}

function undefObjectAssign(targetObject, sourceObject) {
  const keys = Object.keys(sourceObject)
  for (const key of keys) {
    if (sourceObject[key]) {
      targetObject[key] = sourceObject[key]
    }
  }

  return targetObject
}

function safeObjectAssign(targetObject, sourceObject, exceptions = []) {
  const keys = Object.keys(targetObject)
  for (const key of keys) {
    if (targetObject[key] && sourceObject[key]) {
      targetObject[key] = sourceObject[key]
    }
  }

  for (const exception of exceptions) {
    if (sourceObject[exception]) {
      targetObject[exception] = sourceObject[exception]
    }
  }

  return targetObject
}

function mtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs
  } catch {
    return null
  }
}

module.exports = (api, options) => {
  const t = api.types
  let env = {}
  options = {
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
    ...options,
  }
  const babelMode = process.env[options.envName] || (process.env.BABEL_ENV && process.env.BABEL_ENV !== 'undefined' && process.env.BABEL_ENV !== 'development' && process.env.BABEL_ENV) || process.env.NODE_ENV || 'development'
  const localFilePath = options.path + '.local'
  const modeFilePath = options.path + '.' + babelMode
  const modeLocalFilePath = options.path + '.' + babelMode + '.local'

  if (options.verbose) {
    console.log('dotenvMode', babelMode)
    if (process.env[options.envName] === 'production' || process.env[options.envName] === 'development') {
      console.error('APP_ENV error', 'cannot use APP_ENV=development or APP_ENV=production')
    }
  }

  api.cache.using(() => mtime(options.path))
  api.cache.using(() => mtime(modeFilePath))
  api.cache.using(() => mtime(localFilePath))
  api.cache.using(() => mtime(modeLocalFilePath))

  const dotenvTemporary = undefObjectAssign({}, process.env)
  const parsed = parseDotenvFile(options.path, options.verbose)
  const localParsed = parseDotenvFile(localFilePath, options.verbose)
  const modeParsed = parseDotenvFile(modeFilePath, options.verbose)
  const modeLocalParsed = parseDotenvFile(modeLocalFilePath, options.verbose)
  env = (options.safe)
    ? safeObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary, ['NODE_ENV', 'BABEL_ENV', options.envName])
    : undefObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary)

  api.addExternalDependency(path.resolve(options.path))
  api.addExternalDependency(path.resolve(modeFilePath))
  api.addExternalDependency(path.resolve(localFilePath))
  api.addExternalDependency(path.resolve(modeLocalFilePath))

  return ({
    name: 'dotenv-import',
    visitor: {
      ImportDeclaration(filepath) {
        if (filepath.node.source.value !== options.moduleName) {
          return
        }

        for (const [index, specifier] of filepath.node.specifiers.entries()) {
          if (specifier.type === 'ImportDefaultSpecifier') {
            throw filepath.get('specifiers')[index].buildCodeFrameError('Default import is not supported')
          }

          if (specifier.type === 'ImportNamespaceSpecifier') {
            throw filepath.get('specifiers')[index].buildCodeFrameError('Wildcard import is not supported')
          }

          if (specifier.imported && specifier.local) {
            const importedId = specifier.imported.name
            const localId = specifier.local.name

            if (Array.isArray(options.allowlist) && !options.allowlist.includes(importedId)) {
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not present in allowlist`)
            }

            if (Array.isArray(options.whitelist) && !options.whitelist.includes(importedId)) {
              console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use allowlist instead')
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not whitelisted`)
            }

            if (Array.isArray(options.blocklist) && options.blocklist.includes(importedId)) {
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not present in blocklist`)
            }

            if (Array.isArray(options.blacklist) && options.blacklist.includes(importedId)) {
              console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use blocklist instead')
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was blacklisted`)
            }

            if (!options.allowUndefined && !Object.hasOwn(env, importedId)) {
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" is not defined in ${options.path}`)
            }

            const binding = filepath.scope.getBinding(localId)
            for (const referencePath of binding.referencePaths) {
              referencePath.replaceWith(t.valueToNode(env[importedId]))
            }
          }
        }

        filepath.remove()
      },
      MemberExpression(filepath) {
        if (!filepath.get('object').matchesPattern('process.env')) {
          return
        }

        const key = filepath.toComputedKey()
        if (t.isStringLiteral(key)) {
          const importedId = key.value
          const value = (env && importedId in env) ? env[importedId] : process.env[importedId]
          if (value !== undefined) {
            filepath.replaceWith(t.valueToNode(value))
          }
        }
      },
    },
  })
}
