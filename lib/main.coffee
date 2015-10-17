{CompositeDisposable} = require 'atom'
fs = null
path = null

module.exports =

  Bundles: null
  bundles: null

  BundleView: null
  bundleview: null

  BundlesView: null
  bundlesview: null

  NameView: null
  nameview: null

  InitFileView: null
  InitFile: null

  createBundleView: ->
    @BundleView ?= require './bundle-view'
    @bundleview ?= new @BundleView()

  createBundlesView: ->
    @BundlesView ?= require './bundles-view'
    @bundlesview ?= new @BundlesView()

  createNameView: ->
    @NameView ?= require './name-view'
    @nameview ?= new @NameView()

  createBundlesInstance: ->
    @Bundles ?= require './bundles'
    @bundles ?= new @Bundles()

  activate: ->
    @loadProjectConfigs()
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:start-packages': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:stop-packages': => @toggle(true)
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:create': => @create()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:edit': => @edit()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:remove': => @remove()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:open-global': ->
      path ?= require 'path'
      atom.workspace.open(path.join(path.dirname(atom.config.getUserConfigPath()), 'package-switch.bundles'))
    @subscriptions.add atom.commands.add '.tree-view .file .name[data-name$="\\.package-switch\\.cson"]', 'package-switch:open-local', ({target}) ->
      atom.workspace.open(target.dataset.path, noopener: true)
    @subscriptions.add atom.config.onDidChange('package-switch.SaveRestore', ({newValue}) => @saveStates() if newValue)

    @subscriptions.add atom.workspace.addOpener (uritoopen, {noopener}) ->
      if uritoopen.endsWith('.package-switch.cson') and not noopener?
        fs ?= require 'fs'
        path ?= require 'path'
        @InitFile ?= require './init-file'
        @InitFileView ?= require './init-file-view'
        @initfileview = new @InitFileView(uri: uritoopen, file: new @InitFile(path.dirname(uritoopen), uritoopen))

  deactivate: ->
    if atom.config.get 'package-switch.SaveRestore'
      atom.config.set 'core.disabledPackages', atom.config.get('package-switch.SaveData')
      atom.config.save()
    @subscriptions.dispose()
    @bundles?.destroy()
    @nameview?.destroy()
    @bundles = null
    @nameview = null
    @bundlesview = null
    @bundleview = null
    @Bundles = null
    @NameView = null
    @BundlesView = null
    @BundleView = null
    @initfileview?.destroy()
    @initfileview = null
    @InitFileView = null
    @InitFile = null

  loadProjectConfigs: ->
    if (p = atom.project.getPaths()).length is 1
      fs ?= require 'fs'
      path ?= require 'path'
      fs.exists (f = path.join(p[0], '.package-switch.cson')), (exists) ->
        return unless exists
        @InitFile ?= require './init-file'
        setTimeout (=> new @InitFile(path.basename(p[0]), f).execute(false)), atom.config.get('package-switch.DeferInitialization')

  toggleCallback: (opposite, bundle) ->
    @bundles.getBundle(bundle.name)?.execute(opposite)

  removeCallback: (bundle) ->
    @bundles.removeBundle bundle.name

  saveStates: ->
    atom.config.set('package-switch.SaveData', atom.config.get('core.disabledPackages').filter (item, index, array) ->
      array.indexOf(item) is index
    )

  toggle: (opposite = false) ->
    @createBundlesInstance()
    @createBundlesView()
    @bundlesview.show(@bundles.getBundles(), (bundle) =>
      @toggleCallback(opposite, bundle)
    , opposite)

  remove: ->
    @createBundlesInstance()
    @createBundlesView()
    @bundlesview.show(@bundles.getBundles(false), (bundle) => @removeCallback(bundle))

  createCallback: (oldname, items) ->
    @createNameView()
    @nameview.show(@bundles, oldname, items, {confirmCallback: (oldname, name, packages) =>
      @nameCallback(oldname, name, packages)
    , backCallback: (oldname, _items) => @create({
      name: oldname
      packages: _items
    })})

  nameCallback: (oldname, name, packages) ->
    if oldname?
      @bundles.replaceBundle oldname, name, packages
    else
      @bundles.addBundle name, packages

  create: (bundle = null) ->
    @createBundlesInstance()
    @createBundleView()
    @bundleview.show(bundle, (oldname, items) => @createCallback(oldname, items))

  edit: ->
    @createBundlesInstance()
    @createBundlesView()
    @bundlesview.show(@bundles.getBundles(false), (bundle) => @create(bundle))

  config:
    SaveRestore:
      title: 'Save and restore packages'
      description: 'Restore package states when deactivating this package (e.g. when closing Atom)'
      type: 'boolean'
      default: false
    SaveData:
      title: 'Package States'
      description: 'Array of packages to disable when deactivating this package'
      type: 'array'
      default: []
    DeferInitialization:
      title: 'Activation Timeout'
      description: 'Number of milliseconds to defer execution of local bundles'
      type: 'integer'
      default: 100
