{$$, View} = require 'atom-space-pen-views'

module.exports =
  class InitFileView extends View
    @content: ->
      @div class: 'package-switch', tabindex: -1, =>
        @div class: 'inset-panel', =>
          @div class: 'panel-heading icon icon-book', outlet: 'name'
          @div class: 'panel-body padded', =>
            @div class: 'package-list', outlet: 'package_list'

    initialize: ({@uri, @file}) ->
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
      obj = {}
      for p in @file.packages
        obj[p.name] = p.action

      for p in atom.packages.getLoadedPackages()
        continue if obj[p.name]?
        obj[p.name] = 'ignored'

      arr = []
      arr.push name: k, action: obj[k] for k in Object.keys(obj)
      arr.sort()

      @package_list.text('')
      @addPackage o for o in arr

    addPackage: ({name, action}) ->
      item = $$ ->
        @div class: "package icon icon-diff-#{action}", name

      item.on 'click', ({currentTarget}) ->
        if currentTarget.classList.contains 'icon-diff-added'
          currentTarget.classList.remove 'icon-diff-added'
          currentTarget.classList.add 'icon-diff-removed'
        else if currentTarget.classList.contains 'icon-diff-ignored'
          currentTarget.classList.remove 'icon-diff-ignored'
          currentTarget.classList.add 'icon-diff-added'
        else
          currentTarget.classList.remove 'icon-diff-removed'
          currentTarget.classList.add 'icon-diff-ignored'

      @package_list.append item

    save: ->
      @file.packages = []
      for child in @package_list.children()
        @file.packages.push name: child.innerText, action: 'added' if child.classList.contains 'icon-diff-added'
        @file.packages.push name: child.innerText, action: 'removed' if child.classList.contains 'icon-diff-removed'
      @file.save()
