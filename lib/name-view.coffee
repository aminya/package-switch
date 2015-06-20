{$,$$,View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable} = require 'atom'

module.exports =
  class NameView extends View
    nameEditor: null

    @content: ->
      @div class:'nameview', =>
        @div class:'block', =>
          @label =>
            @div class:'bundle-name', 'Bundle Name'
          @subview 'bundle_name', new TextEditorView(mini:true)
          @div id:'name-error-none' ,class:'error hidden', 'This field cannot be empty'
          @div id:'name-error-used' ,class:'error hidden', 'Name already used'
        @div class:'block text-subtle', =>
          @div class:'added icon icon-diff-added hidden', outlet:'added'
          @div class:'removed icon icon-diff-removed hidden', outlet: 'removed'
        @div class:'buttons', =>
          @div =>
            @div class: 'btn btn-error icon icon-x inline-block-tight', 'Cancel'
            @div class:' btn btn-error icon icon-arrow-left inline-block-tight', 'Back'
          @div class: 'btn btn-primary icon icon-check inline-block-tight', 'Accept'

    initialize: ->
      @nameEditor = @bundle_name.getModel()

      @disposables = new CompositeDisposable

      @on 'click', '.buttons .icon-x', @cancel
      @on 'click', '.buttons .icon-check', @accept
      @on 'click', '.buttons .icon-arrow-left', @back

      @disposables.add atom.commands.add @element,
        'core:confirm': @accept
        'core:cancel': @cancel

    destroy: ->
      @disposables.dispose()
      @detach()
      @panel?.hide()

    cancel: (event) =>
      @panel?.hide()
      event.stopPropagation()

    back: (event) =>
      @backCallback @oldname, @items
      @cancel event

    accept: (event) =>
      if not @validInput()
        if @nameEditor.getText() is ''
          @find('#name-error-none').removeClass('hidden')
        else
          @find('#name-error-used').removeClass('hidden')
      else
        @cancel event
        @confirmCallback @oldname, @nameEditor.getText(), @items

    validInput: ->
      @clearErrors()
      @nameEditor.getText() isnt '' and (@oldname? or not @bundles.getBundle(@nameEditor.getText())?)

    clearErrors: ->
      @find('#name-error-none').addClass('hidden')
      @find('#name-error-used').addClass('hidden')

    clearPackages: ->
      @added.addClass 'hidden'
      @removed.addClass 'hidden'

    showPackages: (div, packages) ->
      div.removeClass('hidden')
      div.html(packages.toString())

    show: (@bundles, @oldname, @items, {@confirmCallback, @backCallback}) ->
      if @oldname?
        @nameEditor.setText @oldname
      else
        @nameEditor.setText ''
      @clearErrors()
      @clearPackages()
      items_added = []
      items_removed = []
      @items.forEach (item) =>
        if item.action is 'added'
          items_added.push item.name
        else
          items_removed.push item.name
      @showPackages @added, items_added if items_added.length isnt 0
      @showPackages @removed, items_removed if items_removed.length isnt 0

      @panel ?= atom.workspace.addModalPanel(item: this)
      @panel.show()
      @bundle_name.focus()
