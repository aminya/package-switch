Bundle = require './bundle'
path = require 'path'
fs = require 'fs'
{Emitter} = require 'atom'
CSON = require 'season'

InitFile = null

module.exports =
  class Bundles
    filename: null
    data: {}
    single_bundles: {}
    project_bundles: {}
    writing: false

    constructor: (arg) ->
      if arg?
        @filename = if arg is '' then null else arg
      else
        @getFileName()
      if @filename?
        @touchFile()
        @getData()
        @watcher = fs.watch @filename, @reload
      else
        @data = {}
      @getPackages()
      @project_bundles = {}
      @emitter = new Emitter

    destroy: ->
      @watcher?.close()
      @emitter.dispose()
      @data = {}
      @single_bundles = {}
      @project_bundles = {}

    reload: (event, filename) =>
      if not @writing
        @getData() if @filename?
        @emitter.emit 'file-change'
      else
        @writing = false

    getFileName: ->
      @filename = path.join(path.dirname(atom.config.getUserConfigPath()), 'package-switch.bundles')

    onFileChange: (callback) ->
      @emitter.on 'file-change', callback

    getData: ->
      try
        data = CSON.readFileSync @filename
        Object.keys(data).forEach (key) =>
          @data[key] = new Bundle(data[key])
      catch error
        @notify 'Error while reading settings from file'

    getPackages: ->
      atom.packages.getAvailablePackageNames().forEach (name) =>
        @single_bundles[name] = new Bundle(packages: [name: name, action: 'added'])

    setData: (emit = true) =>
      if @filename?
        try
          @writing = true
          CSON.writeFileSync @filename, @data
          @emitter.emit 'file-change' if emit
        catch error
          @notify "Settings could not be written to #{@filename}"
      else
        @reload()

    notify: (message) ->
      atom.notifications?.addError message
      console.log('package-switch: ' + message)

    touchFile: ->
      if not fs.existsSync @filename
        fs.writeFileSync @filename, '{}'

    addBundle: (name, packages) ->
      if @data[name]?
        @notify "Bundle \"#{name}\" already exists"
      else
        @data[name] = new Bundle({packages})
        @setData()

    replaceBundle: (oldname, name, packages) ->
      if (oldname is name and @data[oldname]?) or (@data[oldname]? and not @data[name]?)
        delete @data[oldname]
        @data[name] = new Bundle({packages})
        @setData()
      else
        @notify "Bundle \"#{oldname}\" not found" if not @data[oldname]
        @notify "Bundle \"#{name}\" already exists" if @data[name]?

    removeBundle: (bundle) ->
      delete @data[bundle]
      @setData()

    getBundle: (bundle) ->
      if (_bundle = @project_bundles[bundle])?
        _bundle
      else if @data[bundle]?
        @data[bundle]
      else
        @single_bundles[bundle]

    getBundles: (singles = true) ->
      p = []
      @project_bundles = {}
      Object.keys(@data).forEach (key) =>
        p.push {
          name: key
          packages: @data[key].packages
        }
      return p unless singles
      for project in atom.project.getPaths()
        if fs.existsSync (f = path.join(project, '.package-switch.cson'))
          InitFile ?= require './init-file'
          if (i = (new InitFile((d = path.basename(project)), f))).packages.length isnt 0
            p.push {
              name: "Project: #{d}"
              packages: i.packages
            }
            @project_bundles["Project: #{d}"] = i
      Object.keys(@single_bundles).forEach (key) =>
        p.push {
          name: key
          packages: @single_bundles[key].packages
        } if not @data[key]?
      p
