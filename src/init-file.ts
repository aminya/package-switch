/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import CSON from "season"

export class InitFile {
  constructor(name, filepath) {
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
    return this.packages.map((p) =>
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
      return CSON.writeFileSync(this.filepath, this.packages)
    } catch (error) {}
  }
}
