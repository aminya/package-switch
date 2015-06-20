{CompositeDisposable} = require 'atom'

module.exports =

  Bundles: null
  bundles: null

  BundleView: null
  bundleview: null

  NameView: null
  nameview: null

  createBundleView: ->
    @BundleView ?= require './bundle-view'
    @bundleview ?= new @BundleView()

  createNameView: ->
    @NameView ?= require './name-view'
    @nameview ?= new @NameView()

  createBundlesInstance: ->
    @Bundles ?= require './bundles'
    @bundles ?= new @Bundles()

  activate: ->
    @createBundlesInstance()
    @subscriptions = new CompositeDisposable
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:toggle': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:create': => @create()
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:edit': => @edit()
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:remove': => @remove()

  deactivate: ->
    @subscriptions.dispose()
    @bundleview?.destroy()
    @bundles?.destroy()
    @nameview?.destroy()
    @bundleview?.destroy()
    @bundles = null
    @nameview = null
    @bundleview = null
    @Bundles = null
    @NameView = null
    @BundleView = null

  #toggle: ->

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
