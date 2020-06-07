/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { SelectListView, $$ } from "atom-space-pen-views-plus"

export class BundlesView extends SelectListView {
  initialize() {
    return super.initialize(...arguments)
  }

  viewForItem({ name, actions }) {
    return $$(function () {
      return this.li({ class: "two-lines" }, () => {
        this.div({ class: "primary-line" }, name)
        return this.div({ class: "secondary-line" }, () => {
          this.div({ class: "added" }, () => {
            if (actions.added.length !== 0) {
              return this.span({ class: "icon icon-diff-added" }, actions.added.toString())
            }
          })
          return this.div({ class: "removed" }, () => {
            if (actions.removed.length !== 0) {
              return this.span({ class: "icon icon-diff-removed" }, actions.removed.toString())
            }
          })
        })
      })
    })
  }

  confirmed(bundle) {
    this.cancel()
    return this.cb(bundle)
  }

  cancelled() {
    return this.panel != null ? this.panel.hide() : undefined
  }

  show(bundles, cb, opposite = false) {
    this.cb = cb
    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({ item: this })
    }
    this.panel.show()

    bundles.forEach(function (bundle, index) {
      bundle.actions = {
        added: [],
        removed: [],
      }
      for (const p of bundle.packages) {
        if (opposite) {
          if (p.action === "removed") {
            bundle.actions.added.push(p.name)
          } else {
            bundle.actions.removed.push(p.name)
          }
        } else {
          if (p.action === "added") {
            bundle.actions.added.push(p.name)
          } else {
            bundle.actions.removed.push(p.name)
          }
        }
      }
      return (bundles[index] = bundle)
    })
    this.setItems(bundles)
    return this.focusFilterEditor()
  }

  getFilterKey() {
    return "name"
  }
}

export const bundlesview = new BundlesView()
