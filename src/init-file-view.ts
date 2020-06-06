/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { View, $$ } from "atom-space-pen-views-plus"

export class InitFileView extends View {
  static content() {
    this.div({ class: "package-switch", tabindex: -1 }, () => {
      this.div({ class: "inset-panel" }, () => {
        this.div({ class: "panel-heading icon icon-book" }, () => {
          this.span({ outlet: "name" })
          this.span({ class: "inline-block btn-group" }, () => {
            this.button({ class: "btn btn-xs" }, "Execute")
            this.button({ class: "opposite btn btn-xs" }, "Execute Opposite")
          })
        })
        this.div({ class: "panel-body padded" }, () => {
          this.div({ class: "package-list", outlet: "package_list" })
        })
      })
    })
  }

  initialize({ uri, file }) {
    this.uri = uri
    this.file = file
    this.find(".btn").on("click", ({ currentTarget }) => {
      this.save()
      this.file.execute(currentTarget.classList.contains("opposite"))
    })
    this.updateContent()
  }

  destroy() {
    this.save()
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
    for (const k of Object.keys(obj)) {
      arr.push({ name: k, action: obj[k] })
    }

    this.package_list.text("")
    arr.map((o) => this.addPackage(o))
  }

  addPackage({ name, action }) {
    const item = $$(function () {
      this.div({ class: "package" }, () => {
        this.div({ class: `item icon icon-diff-${action}` }, name)
      })
    })

    item.on("click", function ({ currentTarget }) {
      const e = currentTarget.children[0]
      if (e.classList.contains("icon-diff-added")) {
        e.classList.remove("icon-diff-added")
        e.classList.add("icon-diff-removed")
      } else if (e.classList.contains("icon-diff-ignored")) {
        e.classList.remove("icon-diff-ignored")
        e.classList.add("icon-diff-added")
      } else {
        e.classList.remove("icon-diff-removed")
        e.classList.add("icon-diff-ignored")
      }
    })

    this.package_list.append(item)
  }

  save() {
    this.file.packages = []
    const package_list_children = Array.from(this.package_list.children())
    for (const child of package_list_children) {
      if (child.children[0].classList.contains("icon-diff-added")) {
        this.file.packages.push({ name: child.children[0].innerText, action: "added" })
      }
      if (child.children[0].classList.contains("icon-diff-removed")) {
        this.file.packages.push({ name: child.children[0].innerText, action: "removed" })
      }
    }
    this.file.save()
  }
}
