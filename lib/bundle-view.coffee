{$,$$,SelectListView} = require 'atom-space-pen-views'

module.exports =
  class BundleView extends SelectListView
    initialize: ->
      super

    viewForItem: ({name, action}) ->
      $$ ->
        @li =>
          @div class:"icon icon-diff-#{action}", name

    confirmed: ->
      if @isDisabled()
        @setNeutral()
      else if @isNeutral()
        @setEnabled()
      else
        @setDisabled()

    cancel: ->
      items = []
      @items.forEach (item) =>
        if item.action isnt 'ignored'
          items.push item
      super
      @panel?.hide()
      if items.length isnt 0
        @cb items

    show: (actions = [], @cb) ->
      @panel ?= atom.workspace.addModalPanel(item: this)
      @panel.show()

      packages = []
      atom.packages.getAvailablePackageNames().forEach (name) =>
        action = actions.filter (item) =>
          item.name is name
        action = action[0]?.action
        if not action?
          action = 'ignored'
        packages.push {name,action}

      @setItems packages
      @focusFilterEditor()

    populateList: (view = null)->
      return super unless view
      new_view = $(@viewForItem view.data('select-list-item'))
      new_view.data('select-list-item', view.data('select-list-item'))
      for item, index in @items
        if item.name is view.data('select-list-item').name
          @items[index].action = view.data('select-list-item').action
          break
      view.replaceWith new_view
      @selectItemView new_view

    getFilterKey: ->
      'name'

    isDisabled: ->
      @getSelectedItemView().data('select-list-item').action is 'removed'

    isNeutral: ->
      @getSelectedItemView().data('select-list-item').action is 'ignored'

    isEnabled: ->
      @getSelectedItemView().data('select-list-item').action is 'added'

    setNeutral: ->
      view = @getSelectedItemView()
      data = view.data('select-list-item')
      data.action = 'ignored'
      @populateList(view)

    setEnabled: ->
      view = @getSelectedItemView()
      data = view.data('select-list-item')
      data.action = 'added'
      @populateList(view)

    setDisabled: ->
      view = @getSelectedItemView()
      data = view.data('select-list-item')
      data.action = 'removed'
      @populateList(view)
