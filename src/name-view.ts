/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { TextEditorView, View } from "atom-space-pen-views-plus"
import { CompositeDisposable } from "atom"

export class NameView extends View {
  nameEditor = null

  static content() {
    this.div({ class: "nameview" }, () => {
      this.div({ class: "block" }, () => {
        this.label(() => {
          this.div({ class: "bundle-name" }, "Bundle Name")
        })
        this.subview("bundle_name", new TextEditorView({ mini: true }))
        this.div({ id: "name-error-none", class: "error hidden" }, "This field cannot be empty")
        this.div({ id: "name-error-used", class: "error hidden" }, "Name already used")
      })
      this.div({ class: "block text-subtle" }, () => {
        this.div({ class: "added icon icon-diff-added hidden", outlet: "added" })
        this.div({ class: "removed icon icon-diff-removed hidden", outlet: "removed" })
      })
      this.div({ class: "buttons" }, () => {
        this.div(() => {
          this.div({ class: "btn btn-error icon icon-x inline-block-tight" }, "Cancel")
          this.div({ class: " btn btn-error icon icon-arrow-left inline-block-tight" }, "Back")
        })
        this.div({ class: "btn btn-primary icon icon-check inline-block-tight" }, "Accept")
      })
    })
  }

  constructor() {
    super()
    this.nameEditor = this.bundle_name.getModel()

    this.disposables = new CompositeDisposable()

    this.on("click", ".buttons .icon-x", (event) => this.cancel(event))
    this.on("click", ".buttons .icon-check", (event) => this.accept(event))
    this.on("click", ".buttons .icon-arrow-left", (event) => this.back(event))

    this.disposables.add(
      atom.commands.add(this.element, {
        "core:confirm": (event) => this.accept(event),
        "core:cancel": (event) => this.cancel(event),
      })
    )
  }

  destroy() {
    this.disposables.dispose()
    this.detach()
    this.panel != null ? this.panel.hide() : undefined
  }

  cancel(event?) {
    if (this.panel != null) {
      this.panel.hide()
    }
    event.stopPropagation()
  }

  back(event?) {
    this.backCallback(this.oldname, this.items)
    this.cancel(event)
  }

  accept(event?) {
    if (!this.validInput()) {
      if (this.nameEditor.getText() === "") {
        this.find("#name-error-none").removeClass("hidden")
      } else {
        this.find("#name-error-used").removeClass("hidden")
      }
    } else {
      this.cancel(event)
      this.confirmCallback(this.oldname, this.nameEditor.getText(), this.items)
    }
  }

  validInput() {
    this.clearErrors()
    return (
      this.nameEditor.getText() !== "" &&
      (this.oldname != null || this.bundles.getBundle(this.nameEditor.getText()) == null)
    )
  }

  clearErrors() {
    this.find("#name-error-none").addClass("hidden")
    this.find("#name-error-used").addClass("hidden")
  }

  clearPackages() {
    this.added.addClass("hidden")
    this.removed.addClass("hidden")
  }

  showPackages(div, packages) {
    div.removeClass("hidden")
    div.html(packages.toString())
  }

  show(bundles, oldname, items, { confirmCallback, backCallback }) {
    this.bundles = bundles
    this.oldname = oldname
    this.items = items
    this.confirmCallback = confirmCallback
    this.backCallback = backCallback
    if (this.oldname != null) {
      this.nameEditor.setText(this.oldname)
    } else {
      this.nameEditor.setText("")
    }
    this.clearErrors()
    this.clearPackages()
    const items_added = []
    const items_removed = []
    this.items.forEach(function (item) {
      if (item.action === "added") {
        items_added.push(item.name)
      } else {
        items_removed.push(item.name)
      }
    })
    if (items_added.length !== 0) {
      this.showPackages(this.added, items_added)
    }
    if (items_removed.length !== 0) {
      this.showPackages(this.removed, items_removed)
    }

    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({ item: this })
    }
    this.panel.show()
    this.bundle_name.focus()
  }
}

export const nameview = new NameView()
