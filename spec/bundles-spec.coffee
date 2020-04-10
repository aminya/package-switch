{ Bundles } = require '../lib/bundles'

describe 'Bundles', ->
  [bundles, bundle] = []

  beforeEach ->
    bundles = new Bundles('')
    bundles.addBundle 'test-bundle', [
      {
        name: 'test1'
        action: 'added'
      }
      {
        name: 'test2'
        action: 'removed'
      }
    ]
    expect(bundles.data['test-bundle'].packages.length).toBe 2

  afterEach ->
    bundles.destroy()

  describe 'On package activation', ->
    it 'creates/loads the project file', ->
      expect(bundles.emitter).toBeDefined()

    it 'loads a package list', ->
      expect(bundles.single_bundles).toBeDefined()

  describe 'When adding a bundle with a name that already exists', ->
    it 'does not add the bundle', ->
      bundles.addBundle 'test-bundle', [
        {
          name: 'test2'
          action: 'added'
        }
        {
          name: 'test3'
          action: 'removed'
        }
      ]
      expect(bundles.data['test-bundle'].packages[0].name).toBe 'test1'

  describe 'When replacing a bundle', ->
    it 'removes the old bundle and adds the new one', ->
      bundles.replaceBundle 'test-bundle', 'test-bundle-2', [
        {
          name: 'test2'
          action: 'added'
        }
        {
          name: 'test3'
          action: 'removed'
        }
      ]
      expect(bundles.data['test-bundle']).toBeUndefined()
      expect(bundles.data['test-bundle-2']).toBeDefined()

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

# TODO
#  describe 'On ::getBundles without singles flag', ->
#    it 'only shows bundles', ->
#      expect(bundles.getBundles(false).length).toBe 1

  describe 'On ::getBundles with singles flag', ->
    it 'shows bundles and packages', ->
      expect(bundles.getBundles(true).length).not.toBe 1
