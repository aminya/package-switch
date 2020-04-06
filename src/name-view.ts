/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NameView;
import { $, $$, View, TextEditorView } from 'atom-space-pen-views';
import { CompositeDisposable } from 'atom';

export default NameView = (function() {
    NameView = class NameView extends View {
      constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.cancel = this.cancel.bind(this);
        this.back = this.back.bind(this);
        this.accept = this.accept.bind(this);
        super(...args);
      }

      static initClass() {
        this.prototype.nameEditor = null;
      }

      static content() {
        return this.div({class: 'nameview'}, () => {
          this.div({class: 'block'}, () => {
            this.label(() => {
              return this.div({class: 'bundle-name'}, 'Bundle Name');
            });
            this.subview('bundle_name', new TextEditorView({mini: true}));
            this.div({id: 'name-error-none', class: 'error hidden'}, 'This field cannot be empty');
            return this.div({id: 'name-error-used', class: 'error hidden'}, 'Name already used');
          });
          this.div({class: 'block text-subtle'}, () => {
            this.div({class: 'added icon icon-diff-added hidden', outlet: 'added'});
            return this.div({class: 'removed icon icon-diff-removed hidden', outlet: 'removed'});
          });
          return this.div({class: 'buttons'}, () => {
            this.div(() => {
              this.div({class: 'btn btn-error icon icon-x inline-block-tight'}, 'Cancel');
              return this.div({class: ' btn btn-error icon icon-arrow-left inline-block-tight'}, 'Back');
            });
            return this.div({class: 'btn btn-primary icon icon-check inline-block-tight'}, 'Accept');
          });
        });
      }

      initialize() {
        this.nameEditor = this.bundle_name.getModel();

        this.disposables = new CompositeDisposable;

        this.on('click', '.buttons .icon-x', this.cancel);
        this.on('click', '.buttons .icon-check', this.accept);
        this.on('click', '.buttons .icon-arrow-left', this.back);

        return this.disposables.add(atom.commands.add(this.element, {
          'core:confirm': this.accept,
          'core:cancel': this.cancel
        }
        )
        );
      }

      destroy() {
        this.disposables.dispose();
        this.detach();
        return (this.panel != null ? this.panel.hide() : undefined);
      }

      cancel(event?) {
        if (this.panel != null) {
          this.panel.hide();
        }
        return event.stopPropagation();
      }

      back(event?) {
        this.backCallback(this.oldname, this.items);
        return this.cancel(event);
      }

      accept(event?) {
        if (!this.validInput()) {
          if (this.nameEditor.getText() === '') {
            return this.find('#name-error-none').removeClass('hidden');
          } else {
            return this.find('#name-error-used').removeClass('hidden');
          }
        } else {
          this.cancel(event);
          return this.confirmCallback(this.oldname, this.nameEditor.getText(), this.items);
        }
      }

      validInput() {
        this.clearErrors();
        return (this.nameEditor.getText() !== '') && ((this.oldname != null) || (this.bundles.getBundle(this.nameEditor.getText()) == null));
      }

      clearErrors() {
        this.find('#name-error-none').addClass('hidden');
        return this.find('#name-error-used').addClass('hidden');
      }

      clearPackages() {
        this.added.addClass('hidden');
        return this.removed.addClass('hidden');
      }

      showPackages(div, packages) {
        div.removeClass('hidden');
        return div.html(packages.toString());
      }

      show(bundles, oldname, items, {confirmCallback, backCallback}) {
        this.bundles = bundles;
        this.oldname = oldname;
        this.items = items;
        this.confirmCallback = confirmCallback;
        this.backCallback = backCallback;
        if (this.oldname != null) {
          this.nameEditor.setText(this.oldname);
        } else {
          this.nameEditor.setText('');
        }
        this.clearErrors();
        this.clearPackages();
        const items_added = [];
        const items_removed = [];
        this.items.forEach(function(item) {
          if (item.action === 'added') {
            return items_added.push(item.name);
          } else {
            return items_removed.push(item.name);
          }
        });
        if (items_added.length !== 0) { this.showPackages(this.added, items_added); }
        if (items_removed.length !== 0) { this.showPackages(this.removed, items_removed); }

        if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}); }
        this.panel.show();
        return this.bundle_name.focus();
      }
    };
    NameView.initClass();
    return NameView;
  })();
