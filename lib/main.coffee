{CompositeDisposable} = require 'atom'

module.exports =

  Bundles: null
  bundles: null

  BundleView: null
  bundleview: null

  BundlesView: null
  bundlesview: null

  NameView: null
  nameview: null

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
    @createBundlesInstance()
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:toggle': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:create': => @create()
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:edit': => @edit()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:remove': => @remove()

  deactivate: ->
    @subscriptions.dispose()
    @bundleview?.destroy()
    @bundles?.destroy()
    @nameview?.destroy()
    @bundlesview?.destroy()
    @bundleview?.destroy()
    @bundles = null
    @nameview = null
    @bundlesview = null
    @bundleview = null
    @Bundles = null
    @NameView = null
    @BundlesView = null
    @BundleView = null

  toggleCallback: (bundle) ->
    @bundles.getBundle(bundle.name).execute()

  removeCallback: (bundle) ->
    @bundles.removeBundle bundle.name

  toggle: ->
    @createBundlesView()
    @bundlesview.show(@bundles.getBundles(), (bundle) => @toggleCallback(bundle))

  remove: ->
    @createBundlesView()
    @bundlesview.show(@bundles.getBundles(), (bundle) => @removeCallback(bundle))

  createCallback: (items) ->
    @createNameView()
    @nameview.show(@bundles, items, {confirmCallback: (name, packages) =>
      @nameCallback(name, packages)
    , backCallback: (items) => @create(items)})

  nameCallback: (name, packages) ->
    @bundles.addBundle name, packages

  create: (items = []) ->
    @createBundleView()
    @bundleview.show(items, (items) => @createCallback(items))

  #edit: ->

  #remove: ->
