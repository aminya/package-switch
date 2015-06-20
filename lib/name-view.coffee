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
          @div class:'icon icon-diff-added', outlet:'added'
          @div class:'icon icon-diff-removed', outlet: 'removed'
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

    cancel: (event) =>
      @panel?.hide()
      event.stopPropagation()

    back: (event) =>
      @backCallback @items
      @cancel event

    accept: (event) =>
      if not @validInput()
        if @nameEditor.getText() is ''
          @find('#name-error-none').removeClass('hidden')
        else
          @find('#name-error-used').removeClass('hidden')
      else
        @cancel event
        @confirmCallback @nameEditor.getText(), @items

    validInput: ->
      @clearErrors()
      @nameEditor.getText() isnt '' and not @bundles.getBundle(@nameEditor.getText())?

    clearErrors: ->
      @find('#name-error-none').addClass('hidden')
      @find('#name-error-used').addClass('hidden')

    show: (@bundles, @items, {@confirmCallback, @backCallback}) ->
      @nameEditor.setText ''
      @clearErrors()
      items_added = []
      items_removed = []
      @items.forEach (item) =>
        if item.action is 'added'
          items_added.push item.name
        else
          items_removed.push item.name
      @added.html(items_added.toString())
      @removed.html(items_removed.toString())

      @panel ?= atom.workspace.addModalPanel(item: this)
      @panel.show()
      @bundle_name.focus()
