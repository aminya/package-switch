/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { CompositeDisposable } from "atom"
let fs = null
let path = null

let Bundles: null
let bundles: null

let BundleView: null
let bundleview: null

let BundlesView: null
let bundlesview: null

let NameView: null
let nameview: null

let InitFileView: null
let InitFile: null


export default {
  createBundleView() {
    if (BundleView == null) {
      BundleView = require("./bundle-view")
    }
    return bundleview != null ? bundleview : (bundleview = new this.BundleView())
  },

  createBundlesView() {
    if (BundlesView == null) {
      BundlesView = require("./bundles-view")
    }
    return bundlesview != null ? bundlesview : (bundlesview = new BundlesView())
  },

  createNameView() {
    if (NameView == null) {
      NameView = require("./name-view")
    }
    return nameview != null ? nameview : (nameview = new NameView())
  },

  createBundlesInstance() {
    if (Bundles == null) {
      Bundles = require("./bundles")
    }
    return bundles != null ? bundles : (bundles = new Bundles())
  },
  loadProjectConfigs() {
    let p
    if ((p = atom.project.getPaths()).length === 1) {
      let f
      if (fs == null) {
        fs = require("fs")
      }
      if (path == null) {
        path = require("path")
      }
      return fs.exists((f = path.join(p[0], ".package-switch.cson")), function (exists) {
        if (!exists) {
          atom.packages.activatePackage("tree-view")
          atom.packages.activatePackage("tabs")
          atom.packages.activatePackage("settings-view")
          return atom.packages.activatePackage("command-palette")
        }
        if (InitFile == null) {
          InitFile = require("./init-file")
        }
        return setTimeout(
          () => new InitFile(path.basename(p[0]), f).execute(false),
          atom.config.get("package-switch.DeferInitialization")
        )
      })
    } else {
      atom.packages.activatePackage("tree-view")
      atom.packages.activatePackage("tabs")
      atom.packages.activatePackage("settings-view")
      return atom.packages.activatePackage("command-palette")
    }
  },

  toggleCallback(opposite, bundle) {
    return __guard__(bundles.getBundle(bundle.name), (x) => x.execute(opposite))
  },

  removeCallback(bundle) {
    return bundles.removeBundle(bundle.name)
  },

  saveStates() {
    return atom.config.set(
      "package-switch.SaveData",
      atom.config.get("core.disabledPackages").filter((item, index, array) => array.indexOf(item) === index)
    )
  },

  toggle(opposite = false) {
    this.createBundlesInstance()
    this.createBundlesView()
    return bundlesview.show(
      bundles.getBundles(),
      (bundle) => {
        return this.toggleCallback(opposite, bundle)
      },
      opposite
    )
  },

  remove() {
    this.createBundlesInstance()
    this.createBundlesView()
    return bundlesview.show(bundles.getBundles(false), (bundle) => this.removeCallback(bundle))
  },

  createCallback(oldname, items) {
    this.createNameView()
    return nameview.show(bundles, oldname, items, {
      confirmCallback: (oldname, name, packages) => {
        return this.nameCallback(oldname, name, packages)
      },
      backCallback: (oldname, _items) =>
        this.create({
          name: oldname,
          packages: _items,
        }),
    })
  },

  nameCallback(oldname, name, packages) {
    if (oldname != null) {
      return bundles.replaceBundle(oldname, name, packages)
    } else {
      return bundles.addBundle(name, packages)
    }
  },

  create(bundle = null) {
    this.createBundlesInstance()
    this.createBundleView()
    return bundleview.show(bundle, (oldname, items) => this.createCallback(oldname, items))
  },

  edit() {
    this.createBundlesInstance()
    this.createBundlesView()
    return bundlesview.show(bundles.getBundles(false), (bundle) => this.create(bundle))
  },
}

export function activate() {
  this.loadProjectConfigs()
  this.subscriptions = new CompositeDisposable()
  this.subscriptions.add(
    atom.commands.add("atom-workspace", { "package-switch:start-packages": () => this.toggle() })
  )
  this.subscriptions.add(
    atom.commands.add("atom-workspace", { "package-switch:stop-packages": () => this.toggle(true) })
  )
  this.subscriptions.add(atom.commands.add("atom-workspace", { "package-switch:create": () => this.create() }))
  this.subscriptions.add(atom.commands.add("atom-workspace", { "package-switch:edit": () => this.edit() }))
  this.subscriptions.add(atom.commands.add("atom-workspace", { "package-switch:remove": () => this.remove() }))
  this.subscriptions.add(
    atom.commands.add("atom-workspace", {
      "package-switch:open-global"() {
        if (path == null) {
          path = require("path")
        }
        return atom.workspace.open(path.join(path.dirname(atom.config.getUserConfigPath()), "package-switch.bundles"))
      },
    })
  )
  this.subscriptions.add(
    atom.commands.add(
      '.tree-view .file .name[data-name$="\\.package-switch\\.cson"]',
      "package-switch:open-local",
      ({ target }) => atom.workspace.open(target.dataset.path, { noopener: true })
    )
  )
  this.subscriptions.add(
    atom.config.onDidChange("package-switch.SaveRestore", ({ newValue }) => {
      if (newValue) {
        return this.saveStates()
      }
    })
  )

  return this.subscriptions.add(
    atom.workspace.addOpener(function (uritoopen, { noopener }) {
      if (uritoopen.endsWith(".package-switch.cson") && noopener == null) {
        if (fs == null) {
          fs = require("fs")
        }
        if (path == null) {
          path = require("path")
        }
        if (InitFile == null) {
          InitFile = require("./init-file")
        }
        if (InitFileView == null) {
          InitFileView = require("./init-file-view")
        }
        return (this.initfileview = new InitFileView({
          uri: uritoopen,
          file: new InitFile(path.dirname(uritoopen), uritoopen),
        }))
      }
    })
  )
}

export function deactivate() {
  if (atom.config.get("package-switch.SaveRestore")) {
    if (atom.config.get("package-switch.InvertSaveData")) {
      const lp = atom.config.get("package-switch.DisableLanguagePackages")
      const saveData = atom.config.get("package-switch.SaveData")
      const disabledPackages = []
      for (let p of atom.packages.getAvailablePackageNames()) {
        if (p === "package-switch") {
          continue
        }
        if (saveData.includes(p)) {
          continue
        }
        if (lp && p.startsWith("language-")) {
          continue
        }
        disabledPackages.push(p)
      }
      atom.config.set("core.disabledPackages", disabledPackages)
    } else {
      atom.config.set("core.disabledPackages", atom.config.get("package-switch.SaveData"))
    }
    atom.config.save()
  }
  this.subscriptions.dispose()
  if (bundles != null) {
    bundles.destroy()
  }
  if (nameview != null) {
    nameview.destroy()
  }
  bundles = null
  nameview = null
  bundlesview = null
  bundleview = null
  Bundles = null
  NameView = null
  BundlesView = null
  BundleView = null
  if (this.initfileview != null) {
    this.initfileview.destroy()
  }
  this.initfileview = null
  InitFileView = null
  return (InitFile = null)
}


export const config = {
  SaveRestore: {
    title: "Save and restore packages",
    description: "Restore package states when deactivating this package (e.g. when closing Atom)",
    type: "boolean",
    default: false,
  },
  SaveData: {
    title: "Package States",
    description: "Array of packages to disable when deactivating this package",
    type: "array",
    default: [],
  },
  DeferInitialization: {
    title: "Activation Timeout",
    description: "Number of milliseconds to defer execution of local bundles",
    type: "integer",
    default: 100,
  },
  InvertSaveData: {
    title: "Invert Package States",
    description:
      'Disable ALL packages EXCEPT those in "Package States". This includes core packages like tabs, tree-view and settings-view!!!',
    type: "boolean",
    default: false,
  },
  DisableLanguagePackages: {
    title: "Do not disable Language Packages",
    description: 'Do not disable language packages. Only if "Invert Package States" is checked',
    type: "boolean",
    default: false,
  },
}

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null ? transform(value) : undefined
}
