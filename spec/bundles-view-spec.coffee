{ BundlesView } = require '../lib/bundles-view'
{$} = require 'atom-space-pen-views-plus'

describe 'Bundles View', ->
  view = null
  callback = null

  beforeEach ->
    view = new BundlesView()
    jasmine.attachToDOM(view.element)
    callback = jasmine.createSpy('callback')

  afterEach ->
    view.cancel()
    expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

  describe 'When loading the view', ->

    beforeEach ->
      view.show([
        {
          name: 'Test-bundle'
          packages: [
            {
              name: 'Test-package-1'
              action: 'added'
            }
            {
              name: 'Test-package-2'
              action: 'added'
            }
          ]
        }
        ], callback)

    it 'displays the panel', ->
      expect(atom.workspace.getModalPanels()[0].visible).toBeTruthy()

    it 'displays the bundles', ->
      expect(view.list.children().length).toBe 1
      child = $(view.list.children()[0])
      expect(child.find('.primary-line').html()).toBe 'Test-bundle'
      expect(child.find('.icon-diff-added').html()).toBe 'Test-package-1,Test-package-2'

    describe 'When cancelling', ->

      beforeEach ->
        atom.commands.dispatch(view.element, 'core:cancel')

      it 'detaches the view', ->
        expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

      it 'does not call the callback', ->
        expect(callback).not.toHaveBeenCalled()

    describe 'When confirming', ->

      beforeEach ->
        item = $(view.list.children()[0])
        item.mousedown()
        item.mouseup()

      it 'detaches the view', ->
        expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

      it 'calls the callback', ->
        expect(callback).toHaveBeenCalledWith {
            name: 'Test-bundle'
            packages: [
              {
                name: 'Test-package-1'
                action: 'added'
              }
              {
                name: 'Test-package-2'
                action: 'added'
              }
            ]
            actions: {
              added: ['Test-package-1', 'Test-package-2']
              removed: []
            }
          }
