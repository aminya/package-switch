module.exports =
  class Bundle
    packages: {}

    constructor: ({@packages}) ->

    execute: ->
      Object.keys(@packages).forEach (key) =>
        if @packages[key] is 'added'
          atom.packages.enablePackage(key)
        else
          atom.packages.disablePackage(key)
