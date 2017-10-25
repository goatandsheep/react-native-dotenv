const {join} = require('path')
const dotenv = require('dotenv')

module.exports = function (data) {
  const t = data.types

  return {
    visitor: {
      ImportDeclaration(path, state) {
        const production = process.env.BABEL_ENV === 'production'
        const options = state.opts

        if (options.replacedModuleName === undefined) {
          return
        }

        const configDir = options.configDir ? options.configDir : './'
        const configFile = options.filename ? options.filename : '.env'

        if (path.node.source.value === options.replacedModuleName) {
          let config = dotenv.config({
            path: join(configDir, configFile),
            silent: true}
          ) || {}

          const platformPath = production ? `${configFile}.production` : `${configFile}.development`

          config = Object.assign(config, dotenv.config({
            path: join(configDir, platformPath), silent: true
          }))

          path.node.specifiers.forEach((specifier, idx) => {
            if (specifier.type === 'ImportDefaultSpecifier') {
              throw path.get('specifiers')[idx].buildCodeFrameError('Import dotenv as default is not supported.')
            }

            const importedId = specifier.imported.name
            const localId = specifier.local.name

            if (!config[importedId]) {
              throw path.get('specifiers')[idx].buildCodeFrameError(`Try to import dotenv variable "${importedId}" which is not defined in any ${configFile} files.'`)
            }

            const binding = path.scope.getBinding(localId)
            binding.referencePaths.forEach(refPath => {
              if (config[importedId]) {
                refPath.replaceWith(t.valueToNode(config[importedId]))
              }
            })
          })

          path.remove()
        }
      }
    }
  }
}
