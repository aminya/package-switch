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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlcy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2J1bmRsZXMtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLCtEQUE0RDtBQUU1RCxNQUFhLFdBQVksU0FBUSxxQ0FBYztJQUM3QyxVQUFVO1FBQ1IsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUE7SUFDdkMsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7UUFDM0IsT0FBTyx5QkFBRSxDQUFDO1lBQ1IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDekMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRTt3QkFDaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTt5QkFDOUU7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7b0JBQ0YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRTt3QkFDekMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQ2hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTt5QkFDbEY7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFNO1FBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ2IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0lBQzNELENBQUM7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEdBQUcsS0FBSztRQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQzFEO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUVqQixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFLEtBQUs7WUFDckMsTUFBTSxDQUFDLE9BQU8sR0FBRztnQkFDZixLQUFLLEVBQUUsRUFBRTtnQkFDVCxPQUFPLEVBQUUsRUFBRTthQUNaLENBQUE7WUFDRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQy9CLElBQUksUUFBUSxFQUFFO29CQUNaLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7d0JBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ2xDO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ3BDO2lCQUNGO3FCQUFNO29CQUNMLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7d0JBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ2xDO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQ3BDO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN0QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0lBQ2pDLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0NBQ0Y7QUF0RUQsa0NBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogZGVjYWZmZWluYXRlIHN1Z2dlc3Rpb25zOlxyXG4gKiBEUzEwMjogUmVtb3ZlIHVubmVjZXNzYXJ5IGNvZGUgY3JlYXRlZCBiZWNhdXNlIG9mIGltcGxpY2l0IHJldHVybnNcclxuICogRFMyMDc6IENvbnNpZGVyIHNob3J0ZXIgdmFyaWF0aW9ucyBvZiBudWxsIGNoZWNrc1xyXG4gKiBGdWxsIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZWNhZmZlaW5hdGUvZGVjYWZmZWluYXRlL2Jsb2IvbWFzdGVyL2RvY3Mvc3VnZ2VzdGlvbnMubWRcclxuICovXHJcbmltcG9ydCB7ICQsICQkLCBTZWxlY3RMaXN0VmlldyB9IGZyb20gXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXHJcblxyXG5leHBvcnQgY2xhc3MgQnVuZGxlc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XHJcbiAgaW5pdGlhbGl6ZSgpIHtcclxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKC4uLmFyZ3VtZW50cylcclxuICB9XHJcblxyXG4gIHZpZXdGb3JJdGVtKHsgbmFtZSwgYWN0aW9ucyB9KSB7XHJcbiAgICByZXR1cm4gJCQoZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5saSh7IGNsYXNzOiBcInR3by1saW5lc1wiIH0sICgpID0+IHtcclxuICAgICAgICB0aGlzLmRpdih7IGNsYXNzOiBcInByaW1hcnktbGluZVwiIH0sIG5hbWUpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGl2KHsgY2xhc3M6IFwic2Vjb25kYXJ5LWxpbmVcIiB9LCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRpdih7IGNsYXNzOiBcImFkZGVkXCIgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYWN0aW9ucy5hZGRlZC5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGFuKHsgY2xhc3M6IFwiaWNvbiBpY29uLWRpZmYtYWRkZWRcIiB9LCBhY3Rpb25zLmFkZGVkLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5kaXYoeyBjbGFzczogXCJyZW1vdmVkXCIgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYWN0aW9ucy5yZW1vdmVkLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwYW4oeyBjbGFzczogXCJpY29uIGljb24tZGlmZi1yZW1vdmVkXCIgfSwgYWN0aW9ucy5yZW1vdmVkLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBjb25maXJtZWQoYnVuZGxlKSB7XHJcbiAgICB0aGlzLmNhbmNlbCgpXHJcbiAgICByZXR1cm4gdGhpcy5jYihidW5kbGUpXHJcbiAgfVxyXG5cclxuICBjYW5jZWxsZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wYW5lbCAhPSBudWxsID8gdGhpcy5wYW5lbC5oaWRlKCkgOiB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIHNob3coYnVuZGxlcywgY2IsIG9wcG9zaXRlID0gZmFsc2UpIHtcclxuICAgIHRoaXMuY2IgPSBjYlxyXG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSlcclxuICAgIH1cclxuICAgIHRoaXMucGFuZWwuc2hvdygpXHJcblxyXG4gICAgYnVuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChidW5kbGUsIGluZGV4KSB7XHJcbiAgICAgIGJ1bmRsZS5hY3Rpb25zID0ge1xyXG4gICAgICAgIGFkZGVkOiBbXSxcclxuICAgICAgICByZW1vdmVkOiBbXSxcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGNvbnN0IHAgb2YgYnVuZGxlLnBhY2thZ2VzKSB7XHJcbiAgICAgICAgaWYgKG9wcG9zaXRlKSB7XHJcbiAgICAgICAgICBpZiAocC5hY3Rpb24gPT09IFwicmVtb3ZlZFwiKSB7XHJcbiAgICAgICAgICAgIGJ1bmRsZS5hY3Rpb25zLmFkZGVkLnB1c2gocC5uYW1lKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnVuZGxlLmFjdGlvbnMucmVtb3ZlZC5wdXNoKHAubmFtZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHAuYWN0aW9uID09PSBcImFkZGVkXCIpIHtcclxuICAgICAgICAgICAgYnVuZGxlLmFjdGlvbnMuYWRkZWQucHVzaChwLm5hbWUpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBidW5kbGUuYWN0aW9ucy5yZW1vdmVkLnB1c2gocC5uYW1lKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gKGJ1bmRsZXNbaW5kZXhdID0gYnVuZGxlKVxyXG4gICAgfSlcclxuICAgIHRoaXMuc2V0SXRlbXMoYnVuZGxlcylcclxuICAgIHJldHVybiB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKClcclxuICB9XHJcblxyXG4gIGdldEZpbHRlcktleSgpIHtcclxuICAgIHJldHVybiBcIm5hbWVcIlxyXG4gIH1cclxufVxyXG4iXX0=