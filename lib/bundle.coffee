module.exports =
  class Bundle
    packages: []

    constructor: ({@packages}) ->

    execute: ->
      for p in @packages
        if p.action is 'added'
          atom.packages.enablePackage(p.name)
        else
          atom.packages.disablePackage(p.name)
