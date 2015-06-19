Bundles = require '../lib/bundles.coffee'

describe 'Bundles', ->
  [bundles, bundle] = []

  beforeEach ->
    bundles = new Bundles('')
    bundles.addBundle('test-bundle',{'test1': 'added', 'test2': 'removed'})
    expect(Object.keys(bundles.data['test-bundle'].packages).length).toBe 2

  afterEach ->
    bundles.destroy()

  describe 'On package activation', ->
    it 'creates/loads the project file', ->
      expect(bundles.emitter).toBeDefined()

  describe 'When adding a bundle with a name that already exists', ->
    it 'does not add the bundle', ->
      bundles.addBundle('test-bundle',{'test2': 'added', 'test3': 'removed'})
      expect(bundles.data['test-bundle'].packages['test1']).toBeDefined()

  describe 'When removing a bundle', ->
    it 'removes the bundle', ->
      bundles.removeBundle 'test-bundle'
      expect(bundles.data['test-bundle']).not.toBeDefined()

  describe 'When executing a bundle', ->
    it 'executes the package actions', ->
      spyOn(atom.packages,'enablePackage')
      spyOn(atom.packages,'disablePackage')
      bundles.getBundle('test-bundle').execute()
      expect(atom.packages.enablePackage).toHaveBeenCalledWith 'test1'
      expect(atom.packages.disablePackage).toHaveBeenCalledWith 'test2'
