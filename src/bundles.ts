/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Bundle } from "./bundle"
import { InitFile, InitFileCSON } from "./init-file"

import path from "path"
import fs from "fs-plus"
import { Emitter } from "atom"

export class Bundles {
  filename = null
  data = {}
  single_bundles = {}
  project_bundles = {}
  writing = false

  constructor(arg?) {
    if (arg) {
      this.filename = arg === "" ? null : arg
    } else {
      this.getFileName()
    }

    if (this.filename != null) {
      this.touchFile()
      this.getData()
      this.watcher = fs.watch(this.filename, this.reload)
    } else {
      this.data = {}
    }
    this.getPackages()
    this.project_bundles = {}
    this.emitter = new Emitter()

  }

  destroy() {
    if (this.watcher != null) {
      this.watcher.close()
    }
    this.emitter.dispose()
    this.data = {}
    this.single_bundles = {}
    this.project_bundles = {}
  }

  reload(event?, filename?) {
    if (!this.writing) {
      if (this.filename != null) {
        this.getData()
      }
      this.emitter.emit("file-change")
    } else {
      this.writing = false
    }
  }

  getFileName() {
    let configdir = atom.config.getUserConfigPath()
    if (!configdir) {
      // TODO
      configdir = atom.project.getPaths()[0]
    }
    if (!configdir) {
      configdir = "./"
    }
    this.filename = path.join(path.dirname(configdir), "package-switch.bundles")
  }

  onFileChange(callback) {
    this.emitter.on("file-change", callback)
  }

  getData() {
    try {
      const data = JSON.parse(fs.readFileSync(this.filename))
      Object.keys(data).forEach((key) => {
        this.data[key] = new Bundle(data[key])
      })
    } catch (error) {
      this.notify("Error while reading settings from file")
    }
  }

  getPackages() {
    // const package_names = atom.packages.getAvailablePackageNames()
    const package_names = getAvailablePackageNames()

    const package_names_len = package_names.length
    for (let i = 0; i < package_names_len; i++) {
      const name = package_names[i]
      this.single_bundles[name] = new Bundle({ packages: [{ name, action: "added" }] })
    }
  }

  setData(emit = true) {
    if (this.filename != null) {
      try {
        this.writing = true
        fs.writeFileSync(this.filename, JSON.stringify(this.data, null, "\t"))
        if (emit) {
          this.emitter.emit("file-change")
        }
      } catch (error) {
        this.notify(`Settings could not be written to ${this.filename}`)
        atom.notifications.addError(error)
      }
    } else {
      this.reload()
    }
  }

  notify(message?) {
    if (atom.notifications != null) {
      atom.notifications.addError(message)
    }
    console.log("package-switch: " + message)
  }

  touchFile() {
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(this.filename, "{}")
    }
  }

  addBundle(name, packages) {
    if (this.data[name] != null) {
      this.notify(`Bundle \"${name}\" already exists`)
    } else {
      this.data[name] = new Bundle({ packages })
      this.setData()
    }
  }

  replaceBundle(oldname, name, packages) {
    if ((oldname === name && this.data[oldname] != null) || (this.data[oldname] != null && this.data[name] == null)) {
      delete this.data[oldname]
      this.data[name] = new Bundle({ packages })
      this.setData()
    } else {
      if (!this.data[oldname]) {
        this.notify(`Bundle \"${oldname}\" not found`)
      }
      if (this.data[name] != null) {
        this.notify(`Bundle \"${name}\" already exists`)
      }
    }
  }

  removeBundle(bundle) {
    delete this.data[bundle]
    this.setData()
  }

  getBundle(bundle) {
    let _bundle
    if ((_bundle = this.project_bundles[bundle]) != null) {
      return _bundle
    } else if (this.data[bundle] != null) {
      return this.data[bundle]
    } else {
      return this.single_bundles[bundle]
    }
  }

  getBundles(singles = true) {
    const p = []
    this.project_bundles = {}
    Object.keys(this.data).forEach((key) => {
      return p.push({
        name: key,
        packages: this.data[key].packages,
      })
    })
    if (!singles) {
      return p
    }
    for (const project of atom.project.getPaths()) {
      const f = path.join(project, ".package-switch.json")
      if (fs.existsSync(f)) {
        let d, i
        if ((i = new InitFile((d = path.basename(project)), f)).packages.length !== 0) {
          p.push({
            name: `Project: ${d}`,
            packages: i.packages,
          })
          this.project_bundles[`Project: ${d}`] = i
        }
      } else {
        // deprecated
        const fcson = path.join(project, ".package-switch.json")
        if (fs.existsSync(fcson)) {
          let d, i
          if ((i = new InitFileCSON((d = path.basename(project)), f)).packages.length !== 0) {
            p.push({
              name: `Project: ${d}`,
              packages: i.packages,
            })
            this.project_bundles[`Project: ${d}`] = i
          }
        }
      }
    }
    Object.keys(this.single_bundles).forEach((key) => {
      if (this.data[key] == null) {
        return p.push({
          name: key,
          packages: this.single_bundles[key].packages,
        })
      }
    })
    return p
  }
}

export const bundles = new Bundles()

// original getting list of packages takes ~10ms.
// https://github.com/atom/atom/blob/eb1ec862273c68ebcf281c8b21d60c8336f046a4/src/package-manager.js#L416
// TODO make a PR
function getAvailablePackages() {

  // 0.58 ms vs 7.58ms!
  const packages = [];
  const packagesByName = new Set();

  const packageDirPaths = atom.packages.packageDirPaths
  for (let i1 = 0, len = packageDirPaths.length; i1 < len; ++i1) {
    const packageDirPath = packageDirPaths[i1]

    if (fs.existsSync(packageDirPath)) {

      const packageNames = fs
        .readdirSync(packageDirPath, { withFileTypes: true })
        .filter(dirent => (dirent.isDirectory() || (dirent.isSymbolicLink() && fs.isDirectorySync(path.join(packageDirPath, dirent.name)))))
        .map(dirent => dirent.name)

      for (let i2 = 0, len2 = packageNames.length; i2 < len2; ++i2) {
        const packageName = packageNames[i2]
        if (
          !packageName.startsWith('.') &&
          !packagesByName.has(packageName)
        ) {
          const packagePath = path.join(packageDirPath, packageName)
          packages.push({
            name: packageName,
            path: packagePath,
            isBundled: false
          });
          packagesByName.add(packageName);
        }
      }
    }
  }

  // 0.56 vs 0.58 ms
  const keys = Object.keys(atom.packages.packageDependencies)
  for (let i = 0, len = keys.length; i < len; ++i) {
    const packageName = keys[i]
    if (!packagesByName.has(packageName)) {
      packages.push({
        name: packageName,
        path: path.join(atom.packages.resourcePath, 'node_modules', packageName),
        isBundled: true
      });
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name))
}


function getAvailablePackageNames() {
  return getAvailablePackages().map(a => a.name)
}
