{ BundleView } = require '../lib/bundle-view'
{$} = require 'atom-space-pen-views-plus'

describe 'Bundle View', ->
  view = null
  callback = null

  beforeEach ->
    view = new BundleView()
    jasmine.attachToDOM(view.element)
    callback = jasmine.createSpy('callback')

  afterEach ->
    view.cancel()
    expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

  describe 'When loading the view by command', ->
    packages = null

    beforeEach ->
      packages = atom.packages.getAvailablePackageNames()
      view.show(null, callback)

    it 'displays the panel', ->
      expect(atom.workspace.getModalPanels()[0].visible).toBeTruthy()

    it 'displays all packages', ->
      expect(view.list.children().length).toBe packages.length

    describe 'When clicking on package', ->
      item = null

      beforeEach ->
        item = view.list.children()[0]
        expect($(item).data('select-list-item').action).toBe 'ignored'
        $(item).mousedown()
        $(item).mouseup()
        item = view.list.children()[0]

      it 'toggles the packages action', ->
        expect($(item).data('select-list-item').action).toBe 'added'

      describe 'When cancelling with actions', ->

        beforeEach ->
          atom.commands.dispatch(view.element, 'core:cancel')

        it 'detaches the view', ->
          expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

        it 'calls the callback function', ->
          expect(callback).toHaveBeenCalledWith null, [
            {
              name: packages[0]
              action: 'added'
            }
          ]

    describe 'When cancelling without any actions', ->

      beforeEach ->
        atom.commands.dispatch(view.element, 'core:cancel')

      it 'detaches the view', ->
        expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

      it 'does not call the callback function', ->
        expect(callback).not.toHaveBeenCalled()

  describe 'When loading the view with actions', ->
    packages = null
    bundle = null

    beforeEach ->
      packages = atom.packages.getAvailablePackageNames()
      bundle = {
        name: null,
        packages: [
          {
            name: packages[0]
            action: 'removed'
          }
        ]
      }
      view.show(bundle, callback)

    it 'displays the panel', ->
      expect(atom.workspace.getModalPanels()[0].visible).toBeTruthy()

    it 'displays all packages', ->
      expect(view.list.children().length).toBe packages.length

    it 'sets the correct action(s)', ->
      expect($(view.list.children()[0]).data('select-list-item').action).toBe 'removed'
