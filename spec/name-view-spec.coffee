{ NameView } = require '../lib/name-view'
{ Bundles } = require '../lib/bundles'

describe 'Name View', ->
  view = null
  callbacks = null
  bundles = null

  beforeEach ->
    bundles = new Bundles('')
    bundles.addBundle 'already-used', [
      {
        name: 'Test-package'
        action: 'added'
      }
      {
        name: 'Test-package-2'
        action: 'removed'
      }
    ]
    view = new NameView()
    jasmine.attachToDOM(view.element)
    callbacks = {
      confirmCallback: jasmine.createSpy('confirm')
      backCallback: jasmine.createSpy('back')
    }

  afterEach ->
    view.destroy()
    bundles.destroy()
    expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

  describe 'When loading the view with items of both action types', ->

    beforeEach ->
      view.show bundles, null, [
        {
          name: 'Test-package'
          action: 'added'
        }
        {
          name: 'Test-package-2'
          action: 'removed'
        }
      ], callbacks

    it 'attaches the view', ->
      expect(atom.workspace.getModalPanels()[0].visible).toBeTruthy()

    it 'shows the items', ->
      expect(view.added.hasClass 'hidden').toBeFalsy()
      expect(view.removed.hasClass 'hidden').toBeFalsy()
      expect(view.added.html()).toBe 'Test-package'
      expect(view.removed.html()).toBe 'Test-package-2'

    describe 'When cancelling', ->

      beforeEach ->
        atom.commands.dispatch(view.element, 'core:cancel')

      it 'detaches the view', ->
        expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

    describe 'When clicking "Back"', ->

      beforeEach ->
        view.find('.icon-arrow-left').click()

      it 'detaches the view', ->
        expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

      it 'calls the backCallback', ->
        expect(callbacks.backCallback).toHaveBeenCalledWith null, [
          {
            name: 'Test-package'
            action: 'added'
          }
          {
            name: 'Test-package-2'
            action: 'removed'
          }
        ]

    describe 'When setting a name', ->

      describe 'that is ""', ->

        beforeEach ->
          view.nameEditor.setText ''
          view.find('.icon-check').click()

        it 'shows an error', ->
          expect(view.find('#name-error-none').hasClass 'hidden').toBeFalsy()
          expect(view.find('#name-error-used').hasClass 'hidden').toBeTruthy()

        it 'does not call the confirmCallback', ->
          expect(callbacks.confirmCallback).not.toHaveBeenCalled()

      describe 'that is already used', ->

        beforeEach ->
          view.nameEditor.setText 'already-used'
          view.find('.icon-check').click()

        it 'shows an error', ->
          expect(view.find('#name-error-none').hasClass 'hidden').toBeTruthy()
          expect(view.find('#name-error-used').hasClass 'hidden').toBeFalsy()

        it 'does not call the confirmCallback', ->
          expect(callbacks.confirmCallback).not.toHaveBeenCalled()

      describe 'that is unique', ->

        beforeEach ->
          view.nameEditor.setText 'unique-name'
          view.find('.icon-check').click()

        it 'detaches the view', ->
          expect(atom.workspace.getModalPanels()[0].visible).toBeFalsy()

        it 'calls the callback function', ->
          expect(callbacks.confirmCallback).toHaveBeenCalledWith null, 'unique-name', [
            {
              name: 'Test-package'
              action: 'added'
            }
            {
              name: 'Test-package-2'
              action: 'removed'
            }
          ]
  describe 'When loading the view with items of one action type', ->

    beforeEach ->
      view.show bundles, null, [
        {
          name: 'Test-package'
          action: 'added'
        }
      ], callbacks

    it 'attaches the view', ->
      expect(atom.workspace.getModalPanels()[0].visible).toBeTruthy()

    it 'shows the items', ->
      expect(view.added.hasClass 'hidden').toBeFalsy()
      expect(view.removed.hasClass 'hidden').toBeTruthy()
      expect(view.added.html()).toBe 'Test-package'
