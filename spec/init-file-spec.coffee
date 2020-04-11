{ InitFile }  = require '../lib/init-file'
{ InitFileView } = require '../lib/init-file-view'
path = require 'path'

describe 'Init File', ->
  [fixturesPath, initFile, spy] = []

  beforeEach ->
    fixturesPath = atom.project.getPaths()[0]
    initFile = new InitFile(path.basename(fixturesPath), path.join(fixturesPath, '.package-switch.json'))
    spy = spyOn(initFile, 'save')

  it 'has a valid filepath field', ->
    expect(initFile.filepath).toBe path.join(fixturesPath, '.package-switch.json')

  it 'has loaded the package settings', ->
    expect(initFile.packages.length).toBe 2

  describe 'Init File Settings', ->
    initFileView = null

    beforeEach ->
      initFileView = new InitFileView(uri: path.join(fixturesPath, '.package-switch.json'), file: initFile)

    afterEach ->
      initFileView?.destroy()

    it 'has loaded all packages', ->
      expect(initFileView.package_list.children().length).toBe atom.packages.getAvailablePackageNames().length

    describe 'on destroy', ->

      beforeEach ->
        initFileView.destroy()
        initFileView = null

      it 'saves the new settings', ->
        expect(spy).toHaveBeenCalled()
