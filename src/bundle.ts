/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export class Bundle {
  private packages: any

  constructor({ packages }) {
    this.packages = packages
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
}
