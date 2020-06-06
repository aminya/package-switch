/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import fs from "fs"

export class InitFile {
  constructor(name, filepath) {
    this.name = name
    this.filepath = filepath
    if (fs.existsSync(this.filepath)) {
      try {
        this.packages = JSON.parse(fs.readFileSync(this.filepath))
        if (this.packages == null) {
          this.packages = []
        }
      } catch (error) {
        atom.notifications.addError(error)
      }
    } else {
      this.packages = []
    }
  }

  execute(opposite) {
    this.packages.map((p) =>
      opposite
        ? p.action === "removed"
          ? atom.packages.enablePackage(p.name)
          : atom.packages.disablePackage(p.name)
        : p.action === "added"
        ? atom.packages.enablePackage(p.name)
        : atom.packages.disablePackage(p.name)
    )
  }

  save() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.packages, null, "\t"))
    } catch (error) {
      atom.notifications.addError(error)
    }
  }
}

// deprecated
let CSON
export class InitFileCSON {
  constructor(name, filepath) {
    atom.notifications.addWarning(`Using CSON config for package-switch is deprecated. 
    Convert ${filepath} to JSON at https://decaffeinate-project.org/repl/`)

    // Dynamic import https://mariusschulz.com/blog/dynamic-import-expressions-in-typescript
    import("season").then((csonloaded) => {
      CSON = csonloaded
    })

    this.name = name
    this.filepath = filepath
    try {
      this.packages = CSON.readFileSync(this.filepath)
      if (this.packages == null) {
        this.packages = []
      }
    } catch (error) {
      this.packages = []
    }
  }

  execute(opposite) {
    this.packages.map((p) =>
      opposite
        ? p.action === "removed"
          ? atom.packages.enablePackage(p.name)
          : atom.packages.disablePackage(p.name)
        : p.action === "added"
        ? atom.packages.enablePackage(p.name)
        : atom.packages.disablePackage(p.name)
    )
  }

  save() {
    try {
      CSON.writeFileSync(this.filepath, this.packages)
    } catch (error) {}
  }
}
