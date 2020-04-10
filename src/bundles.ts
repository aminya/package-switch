/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Bundle } from "./bundle"
import path from "path"
import fs from "fs"
import { Emitter } from "atom"
import CSON from "season"

let InitFile = null

export class Bundles {
  filename = null
  data = {}
  single_bundles = {}
  project_bundles = {}
  writing = false

  constructor(arg?) {
    this.reload = this.reload.bind(this)
    this.setData = this.setData.bind(this)
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
    return (this.project_bundles = {})
  }

  reload(event?, filename?) {
    if (!this.writing) {
      if (this.filename != null) {
        this.getData()
      }
      return this.emitter.emit("file-change")
    } else {
      return (this.writing = false)
    }
  }

  getFileName() {
    return (this.filename = path.join(path.dirname(atom.config.getUserConfigPath()), "package-switch.bundles"))
  }

  onFileChange(callback) {
    return this.emitter.on("file-change", callback)
  }

  getData() {
    try {
      const data = CSON.readFileSync(this.filename)
      return Object.keys(data).forEach((key) => {
        return (this.data[key] = new Bundle(data[key]))
      })
    } catch (error) {
      return this.notify("Error while reading settings from file")
    }
  }

  getPackages() {
    return atom.packages.getAvailablePackageNames().forEach((name) => {
      return (this.single_bundles[name] = new Bundle({ packages: [{ name, action: "added" }] }))
    })
  }

  setData(emit = true) {
    if (this.filename != null) {
      try {
        this.writing = true
        CSON.writeFileSync(this.filename, this.data)
        if (emit) {
          return this.emitter.emit("file-change")
        }
      } catch (error) {
        return this.notify(`Settings could not be written to ${this.filename}`)
      }
    } else {
      return this.reload()
    }
  }

  notify(message?) {
    if (atom.notifications != null) {
      atom.notifications.addError(message)
    }
    return console.log("package-switch: " + message)
  }

  touchFile() {
    if (!fs.existsSync(this.filename)) {
      return fs.writeFileSync(this.filename, "{}")
    }
  }

  addBundle(name, packages) {
    if (this.data[name] != null) {
      return this.notify(`Bundle \"${name}\" already exists`)
    } else {
      this.data[name] = new Bundle({ packages })
      return this.setData()
    }
  }

  replaceBundle(oldname, name, packages) {
    if ((oldname === name && this.data[oldname] != null) || (this.data[oldname] != null && this.data[name] == null)) {
      delete this.data[oldname]
      this.data[name] = new Bundle({ packages })
      return this.setData()
    } else {
      if (!this.data[oldname]) {
        this.notify(`Bundle \"${oldname}\" not found`)
      }
      if (this.data[name] != null) {
        return this.notify(`Bundle \"${name}\" already exists`)
      }
    }
  }

  removeBundle(bundle) {
    delete this.data[bundle]
    return this.setData()
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
    for (let project of atom.project.getPaths()) {
      var f
      if (fs.existsSync((f = path.join(project, ".package-switch.cson")))) {
        var d, i
        if (InitFile == null) {
          InitFile = require("./init-file")
        }
        if ((i = new InitFile((d = path.basename(project)), f)).packages.length !== 0) {
          p.push({
            name: `Project: ${d}`,
            packages: i.packages,
          })
          this.project_bundles[`Project: ${d}`] = i
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
