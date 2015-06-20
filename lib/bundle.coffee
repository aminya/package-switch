module.exports =
  class Bundle
    packages: []

    constructor: ({@packages}) ->

    execute: (opposite)->
      for p in @packages
        if opposite
          if p.action is 'removed'
            atom.packages.enablePackage(p.name)
          else
            atom.packages.disablePackage(p.name)
        else
          if p.action is 'added'
            atom.packages.enablePackage(p.name)
          else
            atom.packages.disablePackage(p.name)
