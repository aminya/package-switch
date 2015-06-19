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
      items = @list.children().children().toArray().filter (node) =>
        $(node).prop('class').split('-').reverse()[0] isnt 'ignored'
      super
      @panel?.hide()
      @cb items

    show: (actions = {}, @cb) ->
      @panel ?= atom.workspace.addModalPanel(item: this)
      @panel.show()

      packages = atom.packages.getAvailablePackageNames()
      items = []
      for p in packages
        items.push
          name: p
          action: if actions[p]? then actions[p] else 'ignored'
      @setItems items
      @focusFilterEditor()

    populateList: (view = null)->
      return super unless view
      new_view = $(@viewForItem view.data('select-list-item'))
      new_view.data('select-list-item', view.data('select-list-item'))
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
