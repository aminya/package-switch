/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Bundle;

export default Bundle = (function() {
    Bundle = class Bundle {
      static initClass() {
        this.prototype.packages = [];
      }

      constructor({packages}) {
        this.packages = packages;
      }

      execute(opposite) {
        return this.packages.map((p) =>
          opposite ?
            p.action === 'removed' ?
              atom.packages.enablePackage(p.name)
            :
              atom.packages.disablePackage(p.name)
          :
            p.action === 'added' ?
              atom.packages.enablePackage(p.name)
            :
              atom.packages.disablePackage(p.name));
      }
    };
    Bundle.initClass();
    return Bundle;
  })();
