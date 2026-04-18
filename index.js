const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function parseDotenvFile(path, verbose = false) {
  let content

  try {
    content = fs.readFileSync(path, 'utf8')
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
  env = (options.safe) ? safeObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary, ['NODE_ENV', 'BABEL_ENV', 'APP_ENV']) : undefObjectAssign(undefObjectAssign(undefObjectAssign(undefObjectAssign(parsed, modeParsed), localParsed), modeLocalParsed), dotenvTemporary)

  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === options.moduleName) {
          const specifiers = path.node.specifiers
          const identifiers = specifiers.map(specifier => specifier.local.name)

          if (specifiers.some(specifier => specifier.type === 'ImportDefaultSpecifier')) {
            throw path.buildCodeFrameError('Default import is not supported')
          }

          if (specifiers.some(specifier => specifier.type === 'ImportNamespaceSpecifier')) {
            throw path.buildCodeFrameError('Wildcard import is not supported')
          }

          const missingIdentifiers = identifiers.filter(identifier => !env[identifier])
          if (missingIdentifiers.length > 0 && !options.allowUndefined) {
            throw path.buildCodeFrameError(`"${missingIdentifiers.join(', ')}" is not defined in .env`)
          }

          path.replaceWithMultiple(
            identifiers.map(identifier =>
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier(identifier),
                  t.stringLiteral(env[identifier] || '')
                )
              ])
            )
          )
        }
      }
    }
  }
}
