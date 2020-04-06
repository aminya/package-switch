{$$, View} = require 'atom-space-pen-views'

module.exports =
  class InitFileView extends View
    @content: ->
      @div class: 'package-switch', tabindex: -1, =>
        @div class: 'inset-panel', =>
          @div class: 'panel-heading icon icon-book', =>
            @span outlet: 'name'
            @span class: 'inline-block btn-group', =>
              @button class: 'btn btn-xs', 'Execute'
              @button class: 'opposite btn btn-xs', 'Execute Opposite'
          @div class: 'panel-body padded', =>
            @div class: 'package-list', outlet: 'package_list'

    initialize: ({@uri, @file}) ->
      @find('.btn').on 'click', ({currentTarget}) =>
        @save()
        @file.execute(currentTarget.classList.contains('opposite'))
      @updateContent()

    destroy: ->
      @save()

    getURI: ->
      @uri

    getTitle: ->
      'Package Switch Settings'

    getIconName: ->
      'tools'

    updateContent: ->
      @name.text @file.name
      obj = {}
      for p in @file.packages
        obj[p.name] = p.action

      for p in atom.packages.getAvailablePackageNames()
        continue if obj[p]?
        obj[p] = 'ignored'

      arr = []
      arr.push name: k, action: obj[k] for k in Object.keys(obj)

      @package_list.text('')
      @addPackage o for o in arr

    addPackage: ({name, action}) ->
      item = $$ ->
        @div class: 'package', =>
          @div class: "item icon icon-diff-#{action}", name

      item.on 'click', ({currentTarget}) ->
        e = currentTarget.children[0]
        if e.classList.contains 'icon-diff-added'
          e.classList.remove 'icon-diff-added'
          e.classList.add 'icon-diff-removed'
        else if e.classList.contains 'icon-diff-ignored'
          e.classList.remove 'icon-diff-ignored'
          e.classList.add 'icon-diff-added'
        else
          e.classList.remove 'icon-diff-removed'
          e.classList.add 'icon-diff-ignored'

      @package_list.append item

    save: ->
      @file.packages = []
      for child in @package_list.children()
        @file.packages.push name: child.children[0].innerText, action: 'added' if child.children[0].classList.contains 'icon-diff-added'
        @file.packages.push name: child.children[0].innerText, action: 'removed' if child.children[0].classList.contains 'icon-diff-removed'
      @file.save()
