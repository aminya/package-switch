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

export default {
  Bundles: null,
  bundles: null,

  BundleView: null,
  bundleview: null,

  BundlesView: null,
  bundlesview: null,

  NameView: null,
  nameview: null,

  InitFileView: null,
  InitFile: null,

  createBundleView() {
    if (this.BundleView == null) {
      this.BundleView = require("./bundle-view")
    }
    return this.bundleview != null ? this.bundleview : (this.bundleview = new this.BundleView())
  },

  createBundlesView() {
    if (this.BundlesView == null) {
      this.BundlesView = require("./bundles-view")
    }
    return this.bundlesview != null ? this.bundlesview : (this.bundlesview = new this.BundlesView())
  },

  createNameView() {
    if (this.NameView == null) {
      this.NameView = require("./name-view")
    }
    return this.nameview != null ? this.nameview : (this.nameview = new this.NameView())
  },

  createBundlesInstance() {
    if (this.Bundles == null) {
      this.Bundles = require("./bundles")
    }
    return this.bundles != null ? this.bundles : (this.bundles = new this.Bundles())
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
        if (this.InitFile == null) {
          this.InitFile = require("./init-file")
        }
        return setTimeout(
          () => new this.InitFile(path.basename(p[0]), f).execute(false),
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
    return __guard__(this.bundles.getBundle(bundle.name), (x) => x.execute(opposite))
  },

  removeCallback(bundle) {
    return this.bundles.removeBundle(bundle.name)
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
    return this.bundlesview.show(
      this.bundles.getBundles(),
      (bundle) => {
        return this.toggleCallback(opposite, bundle)
      },
      opposite
    )
  },

  remove() {
    this.createBundlesInstance()
    this.createBundlesView()
    return this.bundlesview.show(this.bundles.getBundles(false), (bundle) => this.removeCallback(bundle))
  },

  createCallback(oldname, items) {
    this.createNameView()
    return this.nameview.show(this.bundles, oldname, items, {
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
      return this.bundles.replaceBundle(oldname, name, packages)
    } else {
      return this.bundles.addBundle(name, packages)
    }
  },

  create(bundle = null) {
    this.createBundlesInstance()
    this.createBundleView()
    return this.bundleview.show(bundle, (oldname, items) => this.createCallback(oldname, items))
  },

  edit() {
    this.createBundlesInstance()
    this.createBundlesView()
    return this.bundlesview.show(this.bundles.getBundles(false), (bundle) => this.create(bundle))
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
        if (this.InitFile == null) {
          this.InitFile = require("./init-file")
        }
        if (this.InitFileView == null) {
          this.InitFileView = require("./init-file-view")
        }
        return (this.initfileview = new this.InitFileView({
          uri: uritoopen,
          file: new this.InitFile(path.dirname(uritoopen), uritoopen),
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
  if (this.bundles != null) {
    this.bundles.destroy()
  }
  if (this.nameview != null) {
    this.nameview.destroy()
  }
  this.bundles = null
  this.nameview = null
  this.bundlesview = null
  this.bundleview = null
  this.Bundles = null
  this.NameView = null
  this.BundlesView = null
  this.BundleView = null
  if (this.initfileview != null) {
    this.initfileview.destroy()
  }
  this.initfileview = null
  this.InitFileView = null
  return (this.InitFile = null)
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
