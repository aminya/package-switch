/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { SelectListView, $, $$ } from "atom-space-pen-views-plus"

export class BundleView extends SelectListView {
  initialize() {
    return super.initialize(...arguments)
  }

  viewForItem({ name, action }) {
    return $$(function () {
      return this.li(() => {
        return this.div({ class: `status-${action} icon icon-diff-${action}` }, name)
      })
    })
  }

  confirmed() {
    if (this.isDisabled()) {
      return this.setNeutral()
    } else if (this.isNeutral()) {
      return this.setEnabled()
    } else {
      return this.setDisabled()
    }
  }

  cancel() {
    const items = []
    this.items.forEach(function (item) {
      if (item.action !== "ignored") {
        return items.push(item)
      }
    })
    super.cancel(...arguments)
    if (this.panel != null) {
      this.panel.hide()
    }
    if (items.length !== 0) {
      return this.cb(this.oldname, items)
    }
  }

  show(bundle = null, cb) {
    let actions
    this.cb = cb
    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({ item: this })
    }
    this.panel.show()

    if (bundle != null) {
      this.oldname = bundle.name
      actions = bundle.packages
    } else {
      this.oldname = null
      actions = []
    }

    const packages = []
    atom.packages.getAvailablePackageNames().forEach(function (name) {
      let action = actions.filter((item) => item.name === name)
      action = action[0] != null ? action[0].action : undefined
      if (action == null) {
        action = "ignored"
      }
      return packages.push({ name, action })
    })

    this.setItems(packages)
    return this.focusFilterEditor()
  }

  populateList(view = null) {
    if (!view) {
      return super.populateList(...arguments)
    }
    const new_view = $(this.viewForItem(view.data("select-list-item")))
    new_view.data("select-list-item", view.data("select-list-item"))
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index]
      if (item.name === view.data("select-list-item").name) {
        this.items[index].action = view.data("select-list-item").action
        break
      }
    }
    view.replaceWith(new_view)
    return this.selectItemView(new_view)
  }

  getFilterKey() {
    return "name"
  }

  isDisabled() {
    return this.getSelectedItemView().data("select-list-item").action === "removed"
  }

  isNeutral() {
    return this.getSelectedItemView().data("select-list-item").action === "ignored"
  }

  isEnabled() {
    return this.getSelectedItemView().data("select-list-item").action === "added"
  }

  setNeutral() {
    const view = this.getSelectedItemView()
    const data = view.data("select-list-item")
    data.action = "ignored"
    return this.populateList(view)
  }

  setEnabled() {
    const view = this.getSelectedItemView()
    const data = view.data("select-list-item")
    data.action = "added"
    return this.populateList(view)
  }

  setDisabled() {
    const view = this.getSelectedItemView()
    const data = view.data("select-list-item")
    data.action = "removed"
    return this.populateList(view)
  }
}

export const bundleview = new BundleView()
