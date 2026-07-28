const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function parseDotenvFile (filepath, verbose = false) {
  try {
    const content = fs.readFileSync(filepath)
    return { parsed: dotenv.parse(content), exists: true }
  } catch (error) {
    // The env file does not exist.
    if (verbose) {
      console.error('react-native-dotenv', error)
    }

    return { parsed: {}, exists: false }
  }
}

// Babel may re-instantiate this plugin per file (e.g. api.cache(false)). Log once
// per process for the same message so Metro workers do not spam stderr.
const loggedInjectMessages = new Set()

function logInjectedEnv (fileEnv, loadedPaths) {
  const keysCount = Object.keys(fileEnv).length
  const message = loadedPaths.length > 0
    ? `◇ injected env (${keysCount}) from ${loadedPaths.join(', ')}`
    : `◇ injected env (${keysCount})`

  if (loggedInjectMessages.has(message)) {
    return
  }

  loggedInjectMessages.add(message)
  console.error(message)
}

function undefObjectAssign (targetObject, sourceObject) {
  const keys = Object.keys(sourceObject)
  for (const key of keys) {
    if (sourceObject[key]) {
      targetObject[key] = sourceObject[key]
    }
  }

  return targetObject
}

function safeObjectAssign (targetObject, sourceObject, exceptions = []) {
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

function mtime (filePath) {
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
    allowlist: null,
    blocklist: null,
    safe: false,
    allowUndefined: true,
    verbose: false,
    quiet: false,
    ...options
  }
  const babelMode = process.env[options.envName] || (process.env.BABEL_ENV && process.env.BABEL_ENV !== 'undefined' && process.env.BABEL_ENV !== 'development' && process.env.BABEL_ENV) || process.env.NODE_ENV || 'development'
  const localFilePath = options.path + '.local'
  const modeFilePath = options.path + '.' + babelMode
  const modeLocalFilePath = options.path + '.' + babelMode + '.local'

  if (options.verbose) {
    console.error(`◇ dotenvMode ${babelMode}`)
    if (process.env[options.envName] === 'production' || process.env[options.envName] === 'development') {
      console.error('APP_ENV error', 'cannot use APP_ENV=development or APP_ENV=production')
    }
  }

  api.cache.using(() => mtime(options.path))
  api.cache.using(() => mtime(modeFilePath))
  api.cache.using(() => mtime(localFilePath))
  api.cache.using(() => mtime(modeLocalFilePath))

  const dotenvTemporary = undefObjectAssign({}, process.env)
  const parsedFile = parseDotenvFile(options.path, options.verbose)
  const localFile = parseDotenvFile(localFilePath, options.verbose)
  const modeFile = parseDotenvFile(modeFilePath, options.verbose)
  const modeLocalFile = parseDotenvFile(modeLocalFilePath, options.verbose)
  const modeExceptions = ['NODE_ENV', 'BABEL_ENV', options.envName]
  const fileEnv = undefObjectAssign(
    undefObjectAssign(
      undefObjectAssign(parsedFile.parsed, modeFile.parsed),
      localFile.parsed
    ),
    modeLocalFile.parsed
  )

  // process.env.X is only inlined for keys from .env files (+ mode exceptions).
  // That stops build-tooling pollution (e.g. Metro jest-worker) without hardcoding
  // tool-specific names. Host/CI values still flow through @env imports below.
  const processEnvInlineKeys = new Set(Object.keys(fileEnv))
  for (const exception of modeExceptions) {
    processEnvInlineKeys.add(exception)
  }

  env = (options.safe)
    ? safeObjectAssign(undefObjectAssign({}, fileEnv), dotenvTemporary, modeExceptions)
    : undefObjectAssign(undefObjectAssign({}, fileEnv), dotenvTemporary)

  if (options.verbose || !options.quiet) {
    const loadedPaths = [
      [options.path, parsedFile.exists],
      [modeFilePath, modeFile.exists],
      [localFilePath, localFile.exists],
      [modeLocalFilePath, modeLocalFile.exists]
    ]
      .filter(([, exists]) => exists)
      .map(([filepath]) => filepath)
    logInjectedEnv(fileEnv, loadedPaths)
  }

  if (typeof api.addExternalDependency === 'function') {
    api.addExternalDependency(path.resolve(options.path))
    api.addExternalDependency(path.resolve(modeFilePath))
    api.addExternalDependency(path.resolve(localFilePath))
    api.addExternalDependency(path.resolve(modeLocalFilePath))
  }

  return ({
    name: 'dotenv-import',
    visitor: {
      ImportDeclaration (filepath) {
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

            if (Array.isArray(options.blocklist) && options.blocklist.includes(importedId)) {
              throw filepath.get('specifiers')[index].buildCodeFrameError(`"${importedId}" was not present in blocklist`)
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
      MemberExpression (filepath) {
        if (!filepath.get('object').matchesPattern('process.env')) {
          return
        }

        const key = filepath.toComputedKey()
        if (t.isStringLiteral(key)) {
          const importedId = key.value
          if (!processEnvInlineKeys.has(importedId)) {
            return
          }
          const value = Object.hasOwn(env, importedId) ? env[importedId] : process.env[importedId]
          if (value !== undefined) {
            filepath.replaceWith(t.valueToNode(value))
          }
        }
      }
    }
  })
}
