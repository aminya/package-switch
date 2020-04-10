"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const init_file_view_1 = require("./init-file-view");
const init_file_1 = require("./init-file");
const bundle_view_1 = require("./bundle-view");
const bundles_view_1 = require("./bundles-view");
const name_view_1 = require("./name-view");
const bundles_1 = require("./bundles");
let bundles;
let bundleview;
let bundlesview;
let nameview;
let initfileview;
let subscriptions;
function activate() {
    loadProjectConfigs();
    subscriptions = new atom_1.CompositeDisposable();
    subscriptions.add(atom.commands.add("atom-workspace", {
        "package-switch:start-packages": () => toggle(),
        "package-switch:stop-packages": () => toggle(true),
        "package-switch:create": () => create(),
        "package-switch:edit": () => edit(),
        "package-switch:remove": () => remove(),
        "package-switch:open-global": () => {
            atom.workspace.open(path_1.default.join(path_1.default.dirname(atom.config.getUserConfigPath()), "package-switch.bundles"));
        },
    }), atom.commands.add('.tree-view .file .name[data-name$="\\.package-switch\\.cson"]', "package-switch:open-local", ({ target }) => atom.workspace.open(target.dataset.path, { noopener: true })), atom.config.onDidChange("package-switch.SaveRestore", ({ newValue }) => {
        if (newValue) {
            saveStates();
        }
    }), atom.workspace.addOpener(function (uritoopen, { noopener }) {
        if (uritoopen.endsWith(".package-switch.cson") && noopener == null) {
            initfileview = new init_file_view_1.InitFileView({
                uri: uritoopen,
                file: new init_file_1.InitFile(path_1.default.dirname(uritoopen), uritoopen),
            });
        }
    }));
}
exports.activate = activate;
function deactivate() {
    if (atom.config.get("package-switch.SaveRestore")) {
        if (atom.config.get("package-switch.InvertSaveData")) {
            const lp = atom.config.get("package-switch.DisableLanguagePackages");
            const saveData = atom.config.get("package-switch.SaveData");
            const disabledPackages = [];
            for (const p of atom.packages.getAvailablePackageNames()) {
                if (p === "package-switch") {
                    continue;
                }
                if (saveData.includes(p)) {
                    continue;
                }
                if (lp && p.startsWith("language-")) {
                    continue;
                }
                disabledPackages.push(p);
            }
            atom.config.set("core.disabledPackages", disabledPackages);
        }
        else {
            atom.config.set("core.disabledPackages", atom.config.get("package-switch.SaveData"));
        }
        atom.config.save();
    }
    subscriptions.dispose();
    if (bundles) {
        bundles.destroy();
    }
    if (nameview) {
        nameview.destroy();
    }
    if (initfileview) {
        initfileview.destroy();
    }
}
exports.deactivate = deactivate;
exports.config = {
    SaveRestore: {
        title: "Save and restore packages",
        description: "Restore package states when deactivating this package (e.g. when closing Atom)",
        type: "boolean",
        default: false,
    },
    SaveData: {
        title: "Package States",
        description: "Array of packages to disable when deactivating this package",
        type: "array",
        default: [],
    },
    DeferInitialization: {
        title: "Activation Timeout",
        description: "Number of milliseconds to defer execution of local bundles",
        type: "integer",
        default: 100,
    },
    InvertSaveData: {
        title: "Invert Package States",
        description: 'Disable ALL packages EXCEPT those in "Package States". This includes core packages like tabs, tree-view and settings-view!!!',
        type: "boolean",
        default: false,
    },
    DisableLanguagePackages: {
        title: "Do not disable Language Packages",
        description: 'Do not disable language packages. Only if "Invert Package States" is checked',
        type: "boolean",
        default: false,
    },
};
function __guard__(value, transform) {
    return typeof value !== "undefined" && value !== null ? transform(value) : undefined;
}
function createBundleView() {
    if (!bundleview) {
        bundleview = new bundle_view_1.BundleView();
    }
}
function createBundlesView() {
    if (!bundlesview) {
        bundlesview = new bundles_view_1.BundlesView();
    }
}
function createNameView() {
    if (!nameview) {
        nameview = new name_view_1.NameView();
    }
}
function createBundlesInstance() {
    if (!bundles) {
        bundles = new bundles_1.Bundles();
    }
}
function loadProjectConfigs() {
    let p;
    if ((p = atom.project.getPaths()).length === 1) {
        let f;
        fs_1.default.stat((f = path_1.default.join(p[0], ".package-switch.cson")), function (fileError, stats) {
            if (fileError && !stats) {
                atom.packages.activatePackage("tree-view");
                atom.packages.activatePackage("tabs");
                atom.packages.activatePackage("settings-view");
                atom.packages.activatePackage("command-palette");
            }
            setTimeout(() => new init_file_1.InitFile(path_1.default.basename(p[0]), f).execute(false), atom.config.get("package-switch.DeferInitialization"));
        });
    }
    else {
        atom.packages.activatePackage("tree-view");
        atom.packages.activatePackage("tabs");
        atom.packages.activatePackage("settings-view");
        atom.packages.activatePackage("command-palette");
    }
}
function toggleCallback(opposite, bundle) {
    __guard__(bundles.getBundle(bundle.name), (x) => x.execute(opposite));
}
function removeCallback(bundle) {
    bundles.removeBundle(bundle.name);
}
function saveStates() {
    atom.config.set("package-switch.SaveData", atom.config.get("core.disabledPackages").filter((item, index, array) => array.indexOf(item) === index));
}
function toggle(opposite = false) {
    createBundlesInstance();
    createBundlesView();
    bundlesview.show(bundles.getBundles(), (bundle) => {
        toggleCallback(opposite, bundle);
    }, opposite);
}
function remove() {
    createBundlesInstance();
    createBundlesView();
    bundlesview.show(bundles.getBundles(false), (bundle) => removeCallback(bundle));
}
function createCallback(oldname, items) {
    createNameView();
    nameview.show(bundles, oldname, items, {
        confirmCallback: (oldname, name, packages) => {
            nameCallback(oldname, name, packages);
        },
        backCallback: (oldname, _items) => create({
            name: oldname,
            packages: _items,
        }),
    });
}
function nameCallback(oldname, name, packages) {
    if (oldname != null) {
        bundles.replaceBundle(oldname, name, packages);
    }
    else {
        bundles.addBundle(name, packages);
    }
}
function create(bundle = null) {
    createBundlesInstance();
    createBundleView();
    bundleview.show(bundle, (oldname, items) => createCallback(oldname, items));
}
function edit() {
    createBundlesInstance();
    createBundlesView();
    bundlesview.show(bundles.getBundles(false), (bundle) => create(bundle));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBTUEsK0JBQTBDO0FBQzFDLDRDQUFtQjtBQUNuQixnREFBdUI7QUFDdkIscURBQStDO0FBQy9DLDJDQUFzQztBQUN0QywrQ0FBMEM7QUFDMUMsaURBQTRDO0FBQzVDLDJDQUFzQztBQUN0Qyx1Q0FBbUM7QUFFbkMsSUFBSSxPQUFnQixDQUFBO0FBQ3BCLElBQUksVUFBc0IsQ0FBQTtBQUMxQixJQUFJLFdBQXdCLENBQUE7QUFDNUIsSUFBSSxRQUFrQixDQUFBO0FBQ3RCLElBQUksWUFBMEIsQ0FBQTtBQUU5QixJQUFJLGFBQWtDLENBQUE7QUFFdEMsU0FBZ0IsUUFBUTtJQUN0QixrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCLGFBQWEsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFFekMsYUFBYSxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNsQywrQkFBK0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDL0MsOEJBQThCLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNsRCx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDdkMscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFO1FBQ25DLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTtRQUN2Qyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtRQUN6RyxDQUFDO0tBQ0YsQ0FBQyxFQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLCtEQUErRCxFQUMvRCwyQkFBMkIsRUFDM0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUM3RSxFQUNELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO1FBQ3JFLElBQUksUUFBUSxFQUFFO1lBQ1osVUFBVSxFQUFFLENBQUE7U0FDYjtJQUNILENBQUMsQ0FBQyxFQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFO1FBQ3hELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDbEUsWUFBWSxHQUFHLElBQUksNkJBQVksQ0FBQztnQkFDOUIsR0FBRyxFQUFFLFNBQVM7Z0JBQ2QsSUFBSSxFQUFFLElBQUksb0JBQVEsQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQzthQUN2RCxDQUFDLENBQUE7U0FDSDtJQUNILENBQUMsQ0FBQyxDQUNILENBQUE7QUFDSCxDQUFDO0FBbkNELDRCQW1DQztBQUVELFNBQWdCLFVBQVU7SUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO1FBQ2pELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsRUFBRTtZQUNwRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1lBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7WUFDM0QsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7WUFDM0IsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEVBQUU7Z0JBQ3hELElBQUksQ0FBQyxLQUFLLGdCQUFnQixFQUFFO29CQUMxQixTQUFRO2lCQUNUO2dCQUNELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDeEIsU0FBUTtpQkFDVDtnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNuQyxTQUFRO2lCQUNUO2dCQUNELGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUN6QjtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLGdCQUFnQixDQUFDLENBQUE7U0FDM0Q7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQTtTQUNyRjtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDbkI7SUFDRCxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDdkIsSUFBSSxPQUFPLEVBQUU7UUFDWCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDbEI7SUFDRCxJQUFJLFFBQVEsRUFBRTtRQUNaLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNuQjtJQUNELElBQUksWUFBWSxFQUFFO1FBQ2hCLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2QjtBQUNILENBQUM7QUFsQ0QsZ0NBa0NDO0FBRVksUUFBQSxNQUFNLEdBQUc7SUFDcEIsV0FBVyxFQUFFO1FBQ1gsS0FBSyxFQUFFLDJCQUEyQjtRQUNsQyxXQUFXLEVBQUUsZ0ZBQWdGO1FBQzdGLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7S0FDZjtJQUNELFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsV0FBVyxFQUFFLDZEQUE2RDtRQUMxRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxFQUFFO0tBQ1o7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFdBQVcsRUFBRSw0REFBNEQ7UUFDekUsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsR0FBRztLQUNiO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFLHVCQUF1QjtRQUM5QixXQUFXLEVBQ1QsOEhBQThIO1FBQ2hJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7S0FDZjtJQUNELHVCQUF1QixFQUFFO1FBQ3ZCLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsV0FBVyxFQUFFLDhFQUE4RTtRQUMzRixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO0tBQ2Y7Q0FDRixDQUFBO0FBRUQsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVM7SUFDakMsT0FBTyxPQUFPLEtBQUssS0FBSyxXQUFXLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUE7QUFDdEYsQ0FBQztBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixVQUFVLEdBQUcsSUFBSSx3QkFBVSxFQUFFLENBQUE7S0FDOUI7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDeEIsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQixXQUFXLEdBQUcsSUFBSSwwQkFBVyxFQUFFLENBQUE7S0FDaEM7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjO0lBQ3JCLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxvQkFBUSxFQUFFLENBQUE7S0FDMUI7QUFDSCxDQUFDO0FBRUQsU0FBUyxxQkFBcUI7SUFDNUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE9BQU8sR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQTtLQUN4QjtBQUNILENBQUM7QUFFRCxTQUFTLGtCQUFrQjtJQUN6QixJQUFJLENBQUMsQ0FBQTtJQUNMLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUMsSUFBSSxDQUFDLENBQUE7UUFDTCxZQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLENBQUMsRUFBRSxVQUFVLFNBQVMsRUFBRSxLQUFLO1lBQy9FLElBQUksU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFBO2dCQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO2FBQ2pEO1lBQ0QsVUFBVSxDQUNSLEdBQUcsRUFBRSxDQUFDLElBQUksb0JBQVEsQ0FBQyxjQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FDdEQsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUFBO0tBQ0g7U0FBTTtRQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUE7S0FDakQ7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU07SUFDdEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDdkUsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLE1BQU07SUFDNUIsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbkMsQ0FBQztBQUVELFNBQVMsVUFBVTtJQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDYix5QkFBeUIsRUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FDdkcsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSztJQUM5QixxQkFBcUIsRUFBRSxDQUFBO0lBQ3ZCLGlCQUFpQixFQUFFLENBQUE7SUFDbkIsV0FBVyxDQUFDLElBQUksQ0FDZCxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQ3BCLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDVCxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ2xDLENBQUMsRUFDRCxRQUFRLENBQ1QsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLE1BQU07SUFDYixxQkFBcUIsRUFBRSxDQUFBO0lBQ3ZCLGlCQUFpQixFQUFFLENBQUE7SUFDbkIsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUNqRixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBTyxFQUFFLEtBQUs7SUFDcEMsY0FBYyxFQUFFLENBQUE7SUFDaEIsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtRQUNyQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzNDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ3ZDLENBQUM7UUFDRCxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDaEMsTUFBTSxDQUFDO1lBQ0wsSUFBSSxFQUFFLE9BQU87WUFDYixRQUFRLEVBQUUsTUFBTTtTQUNqQixDQUFDO0tBQ0wsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUTtJQUMzQyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7UUFDbkIsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQy9DO1NBQU07UUFDTCxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNsQztBQUNILENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSTtJQUMzQixxQkFBcUIsRUFBRSxDQUFBO0lBQ3ZCLGdCQUFnQixFQUFFLENBQUE7SUFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDN0UsQ0FBQztBQUVELFNBQVMsSUFBSTtJQUNYLHFCQUFxQixFQUFFLENBQUE7SUFDdkIsaUJBQWlCLEVBQUUsQ0FBQTtJQUNuQixXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ3pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogZGVjYWZmZWluYXRlIHN1Z2dlc3Rpb25zOlxuICogRFMxMDM6IFJld3JpdGUgY29kZSB0byBubyBsb25nZXIgdXNlIF9fZ3VhcmRfX1xuICogRFMyMDc6IENvbnNpZGVyIHNob3J0ZXIgdmFyaWF0aW9ucyBvZiBudWxsIGNoZWNrc1xuICogRnVsbCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vZGVjYWZmZWluYXRlL2RlY2FmZmVpbmF0ZS9ibG9iL21hc3Rlci9kb2NzL3N1Z2dlc3Rpb25zLm1kXG4gKi9cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiXG5pbXBvcnQgZnMgZnJvbSBcImZzXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCB7IEluaXRGaWxlVmlldyB9IGZyb20gXCIuL2luaXQtZmlsZS12aWV3XCJcbmltcG9ydCB7IEluaXRGaWxlIH0gZnJvbSBcIi4vaW5pdC1maWxlXCJcbmltcG9ydCB7IEJ1bmRsZVZpZXcgfSBmcm9tIFwiLi9idW5kbGUtdmlld1wiXG5pbXBvcnQgeyBCdW5kbGVzVmlldyB9IGZyb20gXCIuL2J1bmRsZXMtdmlld1wiXG5pbXBvcnQgeyBOYW1lVmlldyB9IGZyb20gXCIuL25hbWUtdmlld1wiXG5pbXBvcnQgeyBCdW5kbGVzIH0gZnJvbSBcIi4vYnVuZGxlc1wiXG5cbmxldCBidW5kbGVzOiBCdW5kbGVzXG5sZXQgYnVuZGxldmlldzogQnVuZGxlVmlld1xubGV0IGJ1bmRsZXN2aWV3OiBCdW5kbGVzVmlld1xubGV0IG5hbWV2aWV3OiBOYW1lVmlld1xubGV0IGluaXRmaWxldmlldzogSW5pdEZpbGVWaWV3XG5cbmxldCBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgbG9hZFByb2plY3RDb25maWdzKClcbiAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICBzdWJzY3JpcHRpb25zLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6c3RhcnQtcGFja2FnZXNcIjogKCkgPT4gdG9nZ2xlKCksXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOnN0b3AtcGFja2FnZXNcIjogKCkgPT4gdG9nZ2xlKHRydWUpLFxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDpjcmVhdGVcIjogKCkgPT4gY3JlYXRlKCksXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOmVkaXRcIjogKCkgPT4gZWRpdCgpLFxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDpyZW1vdmVcIjogKCkgPT4gcmVtb3ZlKCksXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOm9wZW4tZ2xvYmFsXCI6ICgpID0+IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGF0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCkpLCBcInBhY2thZ2Utc3dpdGNoLmJ1bmRsZXNcIikpXG4gICAgICB9LFxuICAgIH0pLFxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVwiXFxcXC5wYWNrYWdlLXN3aXRjaFxcXFwuY3NvblwiXScsXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOm9wZW4tbG9jYWxcIixcbiAgICAgICh7IHRhcmdldCB9KSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKHRhcmdldC5kYXRhc2V0LnBhdGgsIHsgbm9vcGVuZXI6IHRydWUgfSlcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFwicGFja2FnZS1zd2l0Y2guU2F2ZVJlc3RvcmVcIiwgKHsgbmV3VmFsdWUgfSkgPT4ge1xuICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgIHNhdmVTdGF0ZXMoKVxuICAgICAgfVxuICAgIH0pLFxuICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcihmdW5jdGlvbiAodXJpdG9vcGVuLCB7IG5vb3BlbmVyIH0pIHtcbiAgICAgIGlmICh1cml0b29wZW4uZW5kc1dpdGgoXCIucGFja2FnZS1zd2l0Y2guY3NvblwiKSAmJiBub29wZW5lciA9PSBudWxsKSB7XG4gICAgICAgIGluaXRmaWxldmlldyA9IG5ldyBJbml0RmlsZVZpZXcoe1xuICAgICAgICAgIHVyaTogdXJpdG9vcGVuLFxuICAgICAgICAgIGZpbGU6IG5ldyBJbml0RmlsZShwYXRoLmRpcm5hbWUodXJpdG9vcGVuKSwgdXJpdG9vcGVuKSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guU2F2ZVJlc3RvcmVcIikpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guSW52ZXJ0U2F2ZURhdGFcIikpIHtcbiAgICAgIGNvbnN0IGxwID0gYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guRGlzYWJsZUxhbmd1YWdlUGFja2FnZXNcIilcbiAgICAgIGNvbnN0IHNhdmVEYXRhID0gYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guU2F2ZURhdGFcIilcbiAgICAgIGNvbnN0IGRpc2FibGVkUGFja2FnZXMgPSBbXVxuICAgICAgZm9yIChjb25zdCBwIG9mIGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKCkpIHtcbiAgICAgICAgaWYgKHAgPT09IFwicGFja2FnZS1zd2l0Y2hcIikge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVEYXRhLmluY2x1ZGVzKHApKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBpZiAobHAgJiYgcC5zdGFydHNXaXRoKFwibGFuZ3VhZ2UtXCIpKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBkaXNhYmxlZFBhY2thZ2VzLnB1c2gocClcbiAgICAgIH1cbiAgICAgIGF0b20uY29uZmlnLnNldChcImNvcmUuZGlzYWJsZWRQYWNrYWdlc1wiLCBkaXNhYmxlZFBhY2thZ2VzKVxuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJjb3JlLmRpc2FibGVkUGFja2FnZXNcIiwgYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guU2F2ZURhdGFcIikpXG4gICAgfVxuICAgIGF0b20uY29uZmlnLnNhdmUoKVxuICB9XG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIGlmIChidW5kbGVzKSB7XG4gICAgYnVuZGxlcy5kZXN0cm95KClcbiAgfVxuICBpZiAobmFtZXZpZXcpIHtcbiAgICBuYW1ldmlldy5kZXN0cm95KClcbiAgfVxuICBpZiAoaW5pdGZpbGV2aWV3KSB7XG4gICAgaW5pdGZpbGV2aWV3LmRlc3Ryb3koKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIFNhdmVSZXN0b3JlOiB7XG4gICAgdGl0bGU6IFwiU2F2ZSBhbmQgcmVzdG9yZSBwYWNrYWdlc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlc3RvcmUgcGFja2FnZSBzdGF0ZXMgd2hlbiBkZWFjdGl2YXRpbmcgdGhpcyBwYWNrYWdlIChlLmcuIHdoZW4gY2xvc2luZyBBdG9tKVwiLFxuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICB9LFxuICBTYXZlRGF0YToge1xuICAgIHRpdGxlOiBcIlBhY2thZ2UgU3RhdGVzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQXJyYXkgb2YgcGFja2FnZXMgdG8gZGlzYWJsZSB3aGVuIGRlYWN0aXZhdGluZyB0aGlzIHBhY2thZ2VcIixcbiAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgZGVmYXVsdDogW10sXG4gIH0sXG4gIERlZmVySW5pdGlhbGl6YXRpb246IHtcbiAgICB0aXRsZTogXCJBY3RpdmF0aW9uIFRpbWVvdXRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlZmVyIGV4ZWN1dGlvbiBvZiBsb2NhbCBidW5kbGVzXCIsXG4gICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgZGVmYXVsdDogMTAwLFxuICB9LFxuICBJbnZlcnRTYXZlRGF0YToge1xuICAgIHRpdGxlOiBcIkludmVydCBQYWNrYWdlIFN0YXRlc1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0Rpc2FibGUgQUxMIHBhY2thZ2VzIEVYQ0VQVCB0aG9zZSBpbiBcIlBhY2thZ2UgU3RhdGVzXCIuIFRoaXMgaW5jbHVkZXMgY29yZSBwYWNrYWdlcyBsaWtlIHRhYnMsIHRyZWUtdmlldyBhbmQgc2V0dGluZ3MtdmlldyEhIScsXG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0sXG4gIERpc2FibGVMYW5ndWFnZVBhY2thZ2VzOiB7XG4gICAgdGl0bGU6IFwiRG8gbm90IGRpc2FibGUgTGFuZ3VhZ2UgUGFja2FnZXNcIixcbiAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBkaXNhYmxlIGxhbmd1YWdlIHBhY2thZ2VzLiBPbmx5IGlmIFwiSW52ZXJ0IFBhY2thZ2UgU3RhdGVzXCIgaXMgY2hlY2tlZCcsXG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0sXG59XG5cbmZ1bmN0aW9uIF9fZ3VhcmRfXyh2YWx1ZSwgdHJhbnNmb3JtKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwgPyB0cmFuc2Zvcm0odmFsdWUpIDogdW5kZWZpbmVkXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1bmRsZVZpZXcoKSB7XG4gIGlmICghYnVuZGxldmlldykge1xuICAgIGJ1bmRsZXZpZXcgPSBuZXcgQnVuZGxlVmlldygpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlc1ZpZXcoKSB7XG4gIGlmICghYnVuZGxlc3ZpZXcpIHtcbiAgICBidW5kbGVzdmlldyA9IG5ldyBCdW5kbGVzVmlldygpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTmFtZVZpZXcoKSB7XG4gIGlmICghbmFtZXZpZXcpIHtcbiAgICBuYW1ldmlldyA9IG5ldyBOYW1lVmlldygpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlc0luc3RhbmNlKCkge1xuICBpZiAoIWJ1bmRsZXMpIHtcbiAgICBidW5kbGVzID0gbmV3IEJ1bmRsZXMoKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRQcm9qZWN0Q29uZmlncygpIHtcbiAgbGV0IHBcbiAgaWYgKChwID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBmXG4gICAgZnMuc3RhdCgoZiA9IHBhdGguam9pbihwWzBdLCBcIi5wYWNrYWdlLXN3aXRjaC5jc29uXCIpKSwgZnVuY3Rpb24gKGZpbGVFcnJvciwgc3RhdHMpIHtcbiAgICAgIGlmIChmaWxlRXJyb3IgJiYgIXN0YXRzKSB7XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidHJlZS12aWV3XCIpXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidGFic1wiKVxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcInNldHRpbmdzLXZpZXdcIilcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJjb21tYW5kLXBhbGV0dGVcIilcbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICgpID0+IG5ldyBJbml0RmlsZShwYXRoLmJhc2VuYW1lKHBbMF0pLCBmKS5leGVjdXRlKGZhbHNlKSxcbiAgICAgICAgYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guRGVmZXJJbml0aWFsaXphdGlvblwiKVxuICAgICAgKVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJ0cmVlLXZpZXdcIilcbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcInRhYnNcIilcbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcInNldHRpbmdzLXZpZXdcIilcbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcImNvbW1hbmQtcGFsZXR0ZVwiKVxuICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUNhbGxiYWNrKG9wcG9zaXRlLCBidW5kbGUpIHtcbiAgX19ndWFyZF9fKGJ1bmRsZXMuZ2V0QnVuZGxlKGJ1bmRsZS5uYW1lKSwgKHgpID0+IHguZXhlY3V0ZShvcHBvc2l0ZSkpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNhbGxiYWNrKGJ1bmRsZSkge1xuICBidW5kbGVzLnJlbW92ZUJ1bmRsZShidW5kbGUubmFtZSlcbn1cblxuZnVuY3Rpb24gc2F2ZVN0YXRlcygpIHtcbiAgYXRvbS5jb25maWcuc2V0KFxuICAgIFwicGFja2FnZS1zd2l0Y2guU2F2ZURhdGFcIixcbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJjb3JlLmRpc2FibGVkUGFja2FnZXNcIikuZmlsdGVyKChpdGVtLCBpbmRleCwgYXJyYXkpID0+IGFycmF5LmluZGV4T2YoaXRlbSkgPT09IGluZGV4KVxuICApXG59XG5cbmZ1bmN0aW9uIHRvZ2dsZShvcHBvc2l0ZSA9IGZhbHNlKSB7XG4gIGNyZWF0ZUJ1bmRsZXNJbnN0YW5jZSgpXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcbiAgYnVuZGxlc3ZpZXcuc2hvdyhcbiAgICBidW5kbGVzLmdldEJ1bmRsZXMoKSxcbiAgICAoYnVuZGxlKSA9PiB7XG4gICAgICB0b2dnbGVDYWxsYmFjayhvcHBvc2l0ZSwgYnVuZGxlKVxuICAgIH0sXG4gICAgb3Bwb3NpdGVcbiAgKVxufVxuXG5mdW5jdGlvbiByZW1vdmUoKSB7XG4gIGNyZWF0ZUJ1bmRsZXNJbnN0YW5jZSgpXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcbiAgYnVuZGxlc3ZpZXcuc2hvdyhidW5kbGVzLmdldEJ1bmRsZXMoZmFsc2UpLCAoYnVuZGxlKSA9PiByZW1vdmVDYWxsYmFjayhidW5kbGUpKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDYWxsYmFjayhvbGRuYW1lLCBpdGVtcykge1xuICBjcmVhdGVOYW1lVmlldygpXG4gIG5hbWV2aWV3LnNob3coYnVuZGxlcywgb2xkbmFtZSwgaXRlbXMsIHtcbiAgICBjb25maXJtQ2FsbGJhY2s6IChvbGRuYW1lLCBuYW1lLCBwYWNrYWdlcykgPT4ge1xuICAgICAgbmFtZUNhbGxiYWNrKG9sZG5hbWUsIG5hbWUsIHBhY2thZ2VzKVxuICAgIH0sXG4gICAgYmFja0NhbGxiYWNrOiAob2xkbmFtZSwgX2l0ZW1zKSA9PlxuICAgICAgY3JlYXRlKHtcbiAgICAgICAgbmFtZTogb2xkbmFtZSxcbiAgICAgICAgcGFja2FnZXM6IF9pdGVtcyxcbiAgICAgIH0pLFxuICB9KVxufVxuXG5mdW5jdGlvbiBuYW1lQ2FsbGJhY2sob2xkbmFtZSwgbmFtZSwgcGFja2FnZXMpIHtcbiAgaWYgKG9sZG5hbWUgIT0gbnVsbCkge1xuICAgIGJ1bmRsZXMucmVwbGFjZUJ1bmRsZShvbGRuYW1lLCBuYW1lLCBwYWNrYWdlcylcbiAgfSBlbHNlIHtcbiAgICBidW5kbGVzLmFkZEJ1bmRsZShuYW1lLCBwYWNrYWdlcylcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGUoYnVuZGxlID0gbnVsbCkge1xuICBjcmVhdGVCdW5kbGVzSW5zdGFuY2UoKVxuICBjcmVhdGVCdW5kbGVWaWV3KClcbiAgYnVuZGxldmlldy5zaG93KGJ1bmRsZSwgKG9sZG5hbWUsIGl0ZW1zKSA9PiBjcmVhdGVDYWxsYmFjayhvbGRuYW1lLCBpdGVtcykpXG59XG5cbmZ1bmN0aW9uIGVkaXQoKSB7XG4gIGNyZWF0ZUJ1bmRsZXNJbnN0YW5jZSgpXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcbiAgYnVuZGxlc3ZpZXcuc2hvdyhidW5kbGVzLmdldEJ1bmRsZXMoZmFsc2UpLCAoYnVuZGxlKSA9PiBjcmVhdGUoYnVuZGxlKSlcbn1cbiJdfQ==