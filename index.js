const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function parseDotenvFile(path, verbose = false) {
  let content

  try {
    content = fs.readFileSync(path)
  } catch (error) {
    // The env file does not exist.
    if (verbose) {
      console.error('react-native-dotenv', error)
    }

    return {}
  }

  return dotenv.parse(content)
}

function undefObjectAssign(targetObject, sourceObject) {
  const keys = Object.keys(sourceObject)
  for (let i = 0, length = keys.length; i < length; i++) {
    if (sourceObject[keys[i]]) {
      targetObject[keys[i]] = sourceObject[keys[i]]
    }
  }

  return targetObject
}

function safeObjectAssign(targetObject, sourceObject, exceptions = []) {
  const keys = Object.keys(targetObject)
  for (let i = 0, length = keys.length; i < length; i++) {
    if (targetObject[keys[i]] && sourceObject[keys[i]]) {
      targetObject[keys[i]] = sourceObject[keys[i]]
    }
  }

  for (let index = 0, length = exceptions.length; index < length; index++) {
    if (sourceObject[exceptions[index]]) {
      targetObject[exceptions[index]] = sourceObject[exceptions[index]]
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
  env = (options.safe) ? safeObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary, ['NODE_ENV', 'BABEL_ENV', options.envName])
    : undefObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary)

  api.addExternalDependency(path.resolve(options.path))
  api.addExternalDependency(path.resolve(modeFilePath))
  api.addExternalDependency(path.resolve(localFilePath))
  api.addExternalDependency(path.resolve(modeLocalFilePath))

  return ({
    name: 'dotenv-import',
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === options.moduleName) {
          for (const [index, specifier] of path.node.specifiers.entries()) {
            if (specifier.type === 'ImportDefaultSpecifier') {
              throw path.get('specifiers')[index].buildCodeFrameError('Default import is not supported')
            }

            if (specifier.type === 'ImportNamespaceSpecifier') {
              throw path.get('specifiers')[index].buildCodeFrameError('Wildcard import is not supported')
            }

            if (specifier.imported && specifier.local) {
              const importedId = specifier.imported.name
              const localId = specifier.local.name

              if (Array.isArray(options.allowlist) && !options.allowlist.includes(importedId)) {
                throw path.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not present in allowlist`)
              } else if (Array.isArray(options.whitelist) && !options.whitelist.includes(importedId)) {
                console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use allowlist instead')
                throw path.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not whitelisted`)
              }

              if (Array.isArray(options.blocklist) && options.blocklist.includes(importedId)) {
                throw path.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not present in blocklist`)
              } else if (Array.isArray(options.blacklist) && options.blacklist.includes(importedId)) {
                console.warn('[DEPRECATION WARNING] This option is will be deprecated soon. Use blocklist instead')
                throw path.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was blacklisted`)
              }

              if (!options.allowUndefined && !Object.hasOwn(env, importedId)) {
                throw path.get('specifiers')[index].buildCodeFrameError(`"${importedId}" is not defined in ${options.path}`)
              }

              const binding = path.scope.getBinding(localId)
              for (const referencePath of binding.referencePaths) {
                referencePath.replaceWith(t.valueToNode(env[importedId]))
              }
            }
          }

          path.remove()
        }
      },
      MemberExpression(path) {
        if (path.get('object').matchesPattern('process.env')) {
          const key = path.toComputedKey()
          if (t.isStringLiteral(key)) {
            const importedId = key.value
            const value = (env && importedId in env) ? env[importedId] : process.env[importedId]
            if (value !== undefined) {
              path.replaceWith(t.valueToNode(value))
            }
          }
        }
      },
    },
  })
}
