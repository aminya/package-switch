{$,$$,SelectListView} = require 'atom-space-pen-views'

module.exports =
  class BundlesView extends SelectListView
    initialize: ->
      super

    viewForItem: ({name, actions}) ->
      $$ ->
        @li class:'two-lines', =>
          @div class:'primary-line', name
          @div class:'secondary-line', =>
            @div class:'added', =>
              @span class:'icon icon-diff-added', actions.added.toString() if actions.added.length isnt 0
            @div class:'removed', =>
              @span class:'icon icon-diff-removed', actions.removed.toString() if actions.removed.length isnt 0

    confirmed: (bundle) ->
      @cancel()
      @cb bundle

    cancelled: ->
      @panel?.hide()

    show: (bundles, @cb) ->
      @panel ?= atom.workspace.addModalPanel(item: this)
      @panel.show()

      bundles.forEach (bundle, index) =>
        bundle['actions'] = {
          added: []
          removed: []
        }
        for p in bundle.packages
          if p.action is 'added'
            bundle.actions.added.push p.name
          else
            bundle.actions.removed.push p.name
        bundles[index] = bundle
      @setItems bundles
      @focusFilterEditor()

    getFilterKey: ->
      'name'
