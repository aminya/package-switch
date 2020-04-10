"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_space_pen_views_1 = require("atom-space-pen-views");
class BundlesView extends atom_space_pen_views_1.SelectListView {
    initialize() {
        return super.initialize(...arguments);
    }
    viewForItem({ name, actions }) {
        return atom_space_pen_views_1.$$(function () {
            return this.li({ class: "two-lines" }, () => {
                this.div({ class: "primary-line" }, name);
                return this.div({ class: "secondary-line" }, () => {
                    this.div({ class: "added" }, () => {
                        if (actions.added.length !== 0) {
                            return this.span({ class: "icon icon-diff-added" }, actions.added.toString());
                        }
                    });
                    return this.div({ class: "removed" }, () => {
                        if (actions.removed.length !== 0) {
                            return this.span({ class: "icon icon-diff-removed" }, actions.removed.toString());
                        }
                    });
                });
            });
        });
    }
    confirmed(bundle) {
        this.cancel();
        return this.cb(bundle);
    }
    cancelled() {
        return this.panel != null ? this.panel.hide() : undefined;
    }
    show(bundles, cb, opposite = false) {
        this.cb = cb;
        if (this.panel == null) {
            this.panel = atom.workspace.addModalPanel({ item: this });
        }
        this.panel.show();
        bundles.forEach(function (bundle, index) {
            bundle.actions = {
                added: [],
                removed: [],
            };
            for (const p of bundle.packages) {
                if (opposite) {
                    if (p.action === "removed") {
                        bundle.actions.added.push(p.name);
                    }
                    else {
                        bundle.actions.removed.push(p.name);
                    }
                }
                else {
                    if (p.action === "added") {
                        bundle.actions.added.push(p.name);
                    }
                    else {
                        bundle.actions.removed.push(p.name);
                    }
                }
            }
            return (bundles[index] = bundle);
        });
        this.setItems(bundles);
        return this.focusFilterEditor();
    }
    getFilterKey() {
        return "name";
    }
}
exports.BundlesView = BundlesView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlcy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2J1bmRsZXMtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLCtEQUE0RDtBQUU1RCxNQUFhLFdBQVksU0FBUSxxQ0FBYztJQUM3QyxVQUFVO1FBQ1IsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUE7SUFDdkMsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7UUFDM0IsT0FBTyx5QkFBRSxDQUFDO1lBQ1IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDekMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRTt3QkFDaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTt5QkFDOUU7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7b0JBQ0YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRTt3QkFDekMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQ2hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTt5QkFDbEY7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFNO1FBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ2IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0lBQzNELENBQUM7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEdBQUcsS0FBSztRQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQzFEO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUVqQixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFLEtBQUs7WUFDckMsTUFBTSxDQUFDLE9BQU8sR0FBRztnQkFDZixLQUFLLEVBQUUsRUFBRTtnQkFDVCxPQUFPLEVBQUUsRUFBRTthQUNaLENBQUE7WUFDRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQy9CLElBQUksUUFBUSxFQUFFO29CQUNaLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7d0JBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ2xDO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ3BDO2lCQUNGO3FCQUFNO29CQUNMLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7d0JBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ2xDO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ3BDO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN0QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0lBQ2pDLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0NBQ0Y7QUF0RUQsa0NBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGRlY2FmZmVpbmF0ZSBzdWdnZXN0aW9uczpcbiAqIERTMTAyOiBSZW1vdmUgdW5uZWNlc3NhcnkgY29kZSBjcmVhdGVkIGJlY2F1c2Ugb2YgaW1wbGljaXQgcmV0dXJuc1xuICogRFMyMDc6IENvbnNpZGVyIHNob3J0ZXIgdmFyaWF0aW9ucyBvZiBudWxsIGNoZWNrc1xuICogRnVsbCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vZGVjYWZmZWluYXRlL2RlY2FmZmVpbmF0ZS9ibG9iL21hc3Rlci9kb2NzL3N1Z2dlc3Rpb25zLm1kXG4gKi9cbmltcG9ydCB7ICQsICQkLCBTZWxlY3RMaXN0VmlldyB9IGZyb20gXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5cbmV4cG9ydCBjbGFzcyBCdW5kbGVzVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3IHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSguLi5hcmd1bWVudHMpXG4gIH1cblxuICB2aWV3Rm9ySXRlbSh7IG5hbWUsIGFjdGlvbnMgfSkge1xuICAgIHJldHVybiAkJChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5saSh7IGNsYXNzOiBcInR3by1saW5lc1wiIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoeyBjbGFzczogXCJwcmltYXJ5LWxpbmVcIiB9LCBuYW1lKVxuICAgICAgICByZXR1cm4gdGhpcy5kaXYoeyBjbGFzczogXCJzZWNvbmRhcnktbGluZVwiIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRpdih7IGNsYXNzOiBcImFkZGVkXCIgfSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGFjdGlvbnMuYWRkZWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwYW4oeyBjbGFzczogXCJpY29uIGljb24tZGlmZi1hZGRlZFwiIH0sIGFjdGlvbnMuYWRkZWQudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiB0aGlzLmRpdih7IGNsYXNzOiBcInJlbW92ZWRcIiB9LCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWN0aW9ucy5yZW1vdmVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGFuKHsgY2xhc3M6IFwiaWNvbiBpY29uLWRpZmYtcmVtb3ZlZFwiIH0sIGFjdGlvbnMucmVtb3ZlZC50b1N0cmluZygpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBjb25maXJtZWQoYnVuZGxlKSB7XG4gICAgdGhpcy5jYW5jZWwoKVxuICAgIHJldHVybiB0aGlzLmNiKGJ1bmRsZSlcbiAgfVxuXG4gIGNhbmNlbGxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lbCAhPSBudWxsID8gdGhpcy5wYW5lbC5oaWRlKCkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIHNob3coYnVuZGxlcywgY2IsIG9wcG9zaXRlID0gZmFsc2UpIHtcbiAgICB0aGlzLmNiID0gY2JcbiAgICBpZiAodGhpcy5wYW5lbCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSlcbiAgICB9XG4gICAgdGhpcy5wYW5lbC5zaG93KClcblxuICAgIGJ1bmRsZXMuZm9yRWFjaChmdW5jdGlvbiAoYnVuZGxlLCBpbmRleCkge1xuICAgICAgYnVuZGxlLmFjdGlvbnMgPSB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgYnVuZGxlLnBhY2thZ2VzKSB7XG4gICAgICAgIGlmIChvcHBvc2l0ZSkge1xuICAgICAgICAgIGlmIChwLmFjdGlvbiA9PT0gXCJyZW1vdmVkXCIpIHtcbiAgICAgICAgICAgIGJ1bmRsZS5hY3Rpb25zLmFkZGVkLnB1c2gocC5uYW1lKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidW5kbGUuYWN0aW9ucy5yZW1vdmVkLnB1c2gocC5uYW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocC5hY3Rpb24gPT09IFwiYWRkZWRcIikge1xuICAgICAgICAgICAgYnVuZGxlLmFjdGlvbnMuYWRkZWQucHVzaChwLm5hbWUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1bmRsZS5hY3Rpb25zLnJlbW92ZWQucHVzaChwLm5hbWUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gKGJ1bmRsZXNbaW5kZXhdID0gYnVuZGxlKVxuICAgIH0pXG4gICAgdGhpcy5zZXRJdGVtcyhidW5kbGVzKVxuICAgIHJldHVybiB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKClcbiAgfVxuXG4gIGdldEZpbHRlcktleSgpIHtcbiAgICByZXR1cm4gXCJuYW1lXCJcbiAgfVxufVxuIl19