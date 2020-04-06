/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { $$, View } from "atom-space-pen-views"

export class InitFileView extends View {
  static content() {
    return this.div({ class: "package-switch", tabindex: -1 }, () => {
      return this.div({ class: "inset-panel" }, () => {
        this.div({ class: "panel-heading icon icon-book" }, () => {
          this.span({ outlet: "name" })
          return this.span({ class: "inline-block btn-group" }, () => {
            this.button({ class: "btn btn-xs" }, "Execute")
            return this.button({ class: "opposite btn btn-xs" }, "Execute Opposite")
          })
        })
        return this.div({ class: "panel-body padded" }, () => {
          return this.div({ class: "package-list", outlet: "package_list" })
        })
      })
    })
  }

  initialize({ uri, file }) {
    this.uri = uri
    this.file = file
    this.find(".btn").on("click", ({ currentTarget }) => {
      this.save()
      return this.file.execute(currentTarget.classList.contains("opposite"))
    })
    return this.updateContent()
  }

  destroy() {
    return this.save()
  }

  getURI() {
    return this.uri
  }

  getTitle() {
    return "Package Switch Settings"
  }

  getIconName() {
    return "tools"
  }

  updateContent() {
    let p
    this.name.text(this.file.name)
    const obj = {}
    for (p of this.file.packages) {
      obj[p.name] = p.action
    }

    for (p of atom.packages.getAvailablePackageNames()) {
      if (obj[p] != null) {
        continue
      }
      obj[p] = "ignored"
    }

    const arr = []
    for (let k of Object.keys(obj)) {
      arr.push({ name: k, action: obj[k] })
    }

    this.package_list.text("")
    return arr.map((o) => this.addPackage(o))
  }

  addPackage({ name, action }) {
    const item = $$(function () {
      return this.div({ class: "package" }, () => {
        return this.div({ class: `item icon icon-diff-${action}` }, name)
      })
    })

    item.on("click", function ({ currentTarget }) {
      const e = currentTarget.children[0]
      if (e.classList.contains("icon-diff-added")) {
        e.classList.remove("icon-diff-added")
        return e.classList.add("icon-diff-removed")
      } else if (e.classList.contains("icon-diff-ignored")) {
        e.classList.remove("icon-diff-ignored")
        return e.classList.add("icon-diff-added")
      } else {
        e.classList.remove("icon-diff-removed")
        return e.classList.add("icon-diff-ignored")
      }
    })

    return this.package_list.append(item)
  }

  save() {
    this.file.packages = []
    for (let child of this.package_list.children()) {
      if (child.children[0].classList.contains("icon-diff-added")) {
        this.file.packages.push({ name: child.children[0].innerText, action: "added" })
      }
      if (child.children[0].classList.contains("icon-diff-removed")) {
        this.file.packages.push({ name: child.children[0].innerText, action: "removed" })
      }
    }
    return this.file.save()
  }
}
