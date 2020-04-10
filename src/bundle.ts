export class Bundle {
  packages: any

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
