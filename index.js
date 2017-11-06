const {readFileSync} = require('fs')
const dotenv = require('dotenv')

module.exports = ({types: t}) => ({
  name: 'dotenv-import',

  pre() {
    this.opts = Object.assign({
      moduleName: '@env',
      path: '.env',
      whitelist: null,
      blacklist: null,
      safe: false,
      allowUndefined: false
    }, this.opts)

    if (this.opts.safe) {
      this.env = dotenv.parse(readFileSync(this.opts.path))
    } else {
      dotenv.config({
        path: this.opts.path
      })
      this.env = process.env
    }
  },

  visitor: {
    ImportDeclaration(path, {opts}) {
      if (path.node.source.value === opts.moduleName) {
        path.node.specifiers.forEach((specifier, idx) => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            throw path.get('specifiers')[idx].buildCodeFrameError('Default import is not supported')
          }

          if (specifier.type === 'ImportNamespaceSpecifier') {
            throw path.get('specifiers')[idx].buildCodeFrameError('Wildcard import is not supported')
          }

          const importedId = specifier.imported.name
          const localId = specifier.local.name

          if (Array.isArray(opts.whitelist) && !opts.whitelist.includes(importedId)) {
            throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was not whitelisted`)
          }

          if (Array.isArray(opts.blacklist) && opts.blacklist.includes(importedId)) {
            throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" was blacklisted`)
          }

          if (!opts.allowUndefined && !Object.prototype.hasOwnProperty.call(this.env, importedId)) {
            throw path.get('specifiers')[idx].buildCodeFrameError(`"${importedId}" is not defined in ${opts.path}`)
          }

          const binding = path.scope.getBinding(localId)
          binding.referencePaths.forEach(refPath => {
            refPath.replaceWith(t.valueToNode(this.env[importedId]))
          })
        })

        path.remove()
      }
    }
  }
})
