CSON = require 'season'

module.exports =
  class InitFile

    constructor: (@name, @filepath) ->
      try
        @packages = CSON.readFileSync @filepath
      catch error
        @packages = []

    execute: (opposite) ->
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
