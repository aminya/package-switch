{CompositeDisposable} = require 'atom'

BundleView = null
bundleview = null

createBundleView = ->
  BundleView ?= require './bundle-view'
  bundleview ?= new BundleView()

module.exports =

  Bundles: null
  bundles: null

  createBundlesInstance: ->
    @Bundles ?= require './bundles'
    @bundles ?= new @Bundles()

  activate: ->
    @subscriptions = new CompositeDisposable
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:toggle': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:create': => @create()
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:edit': => @edit()
    #@subscriptions.add atom.commands.add 'atom-workspace', 'package-switch:remove': => @remove()

  deactivate: ->
    @subscriptions.dispose()
    @bundleview?.destroy()
    @bundles?.destroy()

  #toggle: ->

  create: ->
    createBundleView()
    bundleview.show({'build-tools-cpp': 'added'},-> )

  #edit: ->

  #remove: ->
