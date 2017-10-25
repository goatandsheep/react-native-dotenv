const dotenv = require('dotenv')

module.exports = function (data) {
  const t = data.types

  return {
    visitor: {
      ImportDeclaration(path, state) {
        const options = Object.assign({
          moduleName: '@env',
          path: '.env'
        }, state.opts)

        if (path.node.source.value === options.moduleName) {
          dotenv.config({
            path: options.path
          })

          path.node.specifiers.forEach((specifier, idx) => {
            if (specifier.type === 'ImportDefaultSpecifier') {
              throw path.get('specifiers')[idx].buildCodeFrameError('Default import is not supported')
            }

            if (specifier.type === 'ImportNamespaceSpecifier') {
              throw path.get('specifiers')[idx].buildCodeFrameError('Wildcard import is not supported')
            }

            const importedId = specifier.imported.name
            const localId = specifier.local.name

            if (!Object.prototype.hasOwnProperty.call(process.env, importedId)) {
              throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" is not defined in ${options.path}`)
            }

            const binding = path.scope.getBinding(localId)
            binding.referencePaths.forEach(refPath => {
              refPath.replaceWith(t.valueToNode(process.env[importedId]))
            })
          })

          path.remove()
        }
      }
    }
  }
}
