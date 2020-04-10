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
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBTUEsK0JBQTBDO0FBQzFDLDRDQUFtQjtBQUNuQixnREFBdUI7QUFDdkIscURBQStDO0FBQy9DLDJDQUFzQztBQUN0QywrQ0FBMEM7QUFDMUMsaURBQTRDO0FBQzVDLDJDQUFzQztBQUN0Qyx1Q0FBbUM7QUFFbkMsSUFBSSxPQUFnQixDQUFBO0FBQ3BCLElBQUksVUFBc0IsQ0FBQTtBQUMxQixJQUFJLFdBQXdCLENBQUE7QUFDNUIsSUFBSSxRQUFrQixDQUFBO0FBQ3RCLElBQUksWUFBMEIsQ0FBQTtBQUU5QixJQUFJLGFBQWtDLENBQUE7QUFFdEMsU0FBZ0IsUUFBUTtJQUN0QixrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCLGFBQWEsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFFekMsYUFBYSxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNsQywrQkFBK0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDOUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNuRCx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDdkMscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFO1FBQ25DLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTtRQUN2Qyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtRQUN6RyxDQUFD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RSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUM3RSxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1gscUJBQXFCLEVBQUUsQ0FBQTtJQUN2QixpQkFBaUIsRUFBRSxDQUFBO0lBQ25CLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDekUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIGRlY2FmZmVpbmF0ZSBzdWdnZXN0aW9uczpcclxuICogRFMxMDM6IFJld3JpdGUgY29kZSB0byBubyBsb25nZXIgdXNlIF9fZ3VhcmRfX1xyXG4gKiBEUzIwNzogQ29uc2lkZXIgc2hvcnRlciB2YXJpYXRpb25zIG9mIG51bGwgY2hlY2tzXHJcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxyXG4gKi9cclxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCJcclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiXHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcclxuaW1wb3J0IHsgSW5pdEZpbGVWaWV3IH0gZnJvbSBcIi4vaW5pdC1maWxlLXZpZXdcIlxyXG5pbXBvcnQgeyBJbml0RmlsZSB9IGZyb20gXCIuL2luaXQtZmlsZVwiXHJcbmltcG9ydCB7IEJ1bmRsZVZpZXcgfSBmcm9tIFwiLi9idW5kbGUtdmlld1wiXHJcbmltcG9ydCB7IEJ1bmRsZXNWaWV3IH0gZnJvbSBcIi4vYnVuZGxlcy12aWV3XCJcclxuaW1wb3J0IHsgTmFtZVZpZXcgfSBmcm9tIFwiLi9uYW1lLXZpZXdcIlxyXG5pbXBvcnQgeyBCdW5kbGVzIH0gZnJvbSBcIi4vYnVuZGxlc1wiXHJcblxyXG5sZXQgYnVuZGxlczogQnVuZGxlc1xyXG5sZXQgYnVuZGxldmlldzogQnVuZGxlVmlld1xyXG5sZXQgYnVuZGxlc3ZpZXc6IEJ1bmRsZXNWaWV3XHJcbmxldCBuYW1ldmlldzogTmFtZVZpZXdcclxubGV0IGluaXRmaWxldmlldzogSW5pdEZpbGVWaWV3XHJcblxyXG5sZXQgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xyXG4gIGxvYWRQcm9qZWN0Q29uZmlncygpXHJcbiAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcclxuXHJcbiAgc3Vic2NyaXB0aW9ucy5hZGQoXHJcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcclxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDpzdGFydC1wYWNrYWdlc1wiOiAoKSA9PiB0b2dnbGUoKSxcclxuICAgICAgIFwicGFja2FnZS1zd2l0Y2g6c3RvcC1wYWNrYWdlc1wiOiAoKSA9PiB0b2dnbGUodHJ1ZSksXHJcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6Y3JlYXRlXCI6ICgpID0+IGNyZWF0ZSgpICxcclxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDplZGl0XCI6ICgpID0+IGVkaXQoKSAsXHJcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6cmVtb3ZlXCI6ICgpID0+IHJlbW92ZSgpLFxyXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOm9wZW4tZ2xvYmFsXCI6ICgpID0+IHtcclxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguam9pbihwYXRoLmRpcm5hbWUoYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKSksIFwicGFja2FnZS1zd2l0Y2guYnVuZGxlc1wiKSlcclxuICAgICAgfVxyXG4gICAgfSksXHJcblxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoXHJcbiAgICAgICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XCJcXFxcLnBhY2thZ2Utc3dpdGNoXFxcXC5jc29uXCJdJyxcclxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDpvcGVuLWxvY2FsXCIsXHJcbiAgICAgICh7IHRhcmdldCB9KSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKHRhcmdldC5kYXRhc2V0LnBhdGgsIHsgbm9vcGVuZXI6IHRydWUgfSlcclxuICAgICksXHJcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcInBhY2thZ2Utc3dpdGNoLlNhdmVSZXN0b3JlXCIsICh7IG5ld1ZhbHVlIH0pID0+IHtcclxuICAgICAgaWYgKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgc2F2ZVN0YXRlcygpXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKGZ1bmN0aW9uICh1cml0b29wZW4sIHsgbm9vcGVuZXIgfSkge1xyXG4gICAgICBpZiAodXJpdG9vcGVuLmVuZHNXaXRoKFwiLnBhY2thZ2Utc3dpdGNoLmNzb25cIikgJiYgbm9vcGVuZXIgPT0gbnVsbCkge1xyXG4gICAgICAgIGluaXRmaWxldmlldyA9IG5ldyBJbml0RmlsZVZpZXcoe1xyXG4gICAgICAgICAgdXJpOiB1cml0b29wZW4sXHJcbiAgICAgICAgICBmaWxlOiBuZXcgSW5pdEZpbGUocGF0aC5kaXJuYW1lKHVyaXRvb3BlbiksIHVyaXRvb3BlbiksXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xyXG4gIGlmIChhdG9tLmNvbmZpZy5nZXQoXCJwYWNrYWdlLXN3aXRjaC5TYXZlUmVzdG9yZVwiKSkge1xyXG4gICAgaWYgKGF0b20uY29uZmlnLmdldChcInBhY2thZ2Utc3dpdGNoLkludmVydFNhdmVEYXRhXCIpKSB7XHJcbiAgICAgIGNvbnN0IGxwID0gYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guRGlzYWJsZUxhbmd1YWdlUGFja2FnZXNcIilcclxuICAgICAgY29uc3Qgc2F2ZURhdGEgPSBhdG9tLmNvbmZpZy5nZXQoXCJwYWNrYWdlLXN3aXRjaC5TYXZlRGF0YVwiKVxyXG4gICAgICBjb25zdCBkaXNhYmxlZFBhY2thZ2VzID0gW11cclxuICAgICAgZm9yIChjb25zdCBwIG9mIGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKCkpIHtcclxuICAgICAgICBpZiAocCA9PT0gXCJwYWNrYWdlLXN3aXRjaFwiKSB7XHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2F2ZURhdGEuaW5jbHVkZXMocCkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChscCAmJiBwLnN0YXJ0c1dpdGgoXCJsYW5ndWFnZS1cIikpIHtcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRpc2FibGVkUGFja2FnZXMucHVzaChwKVxyXG4gICAgICB9XHJcbiAgICAgIGF0b20uY29uZmlnLnNldChcImNvcmUuZGlzYWJsZWRQYWNrYWdlc1wiLCBkaXNhYmxlZFBhY2thZ2VzKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXRvbS5jb25maWcuc2V0KFwiY29yZS5kaXNhYmxlZFBhY2thZ2VzXCIsIGF0b20uY29uZmlnLmdldChcInBhY2thZ2Utc3dpdGNoLlNhdmVEYXRhXCIpKVxyXG4gICAgfVxyXG4gICAgYXRvbS5jb25maWcuc2F2ZSgpXHJcbiAgfVxyXG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXHJcbiAgaWYgKGJ1bmRsZXMpIHtcclxuICAgIGJ1bmRsZXMuZGVzdHJveSgpXHJcbiAgfVxyXG4gIGlmIChuYW1ldmlldykge1xyXG4gICAgbmFtZXZpZXcuZGVzdHJveSgpXHJcbiAgfVxyXG4gIGlmIChpbml0ZmlsZXZpZXcpIHtcclxuICAgIGluaXRmaWxldmlldy5kZXN0cm95KClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgU2F2ZVJlc3RvcmU6IHtcclxuICAgIHRpdGxlOiBcIlNhdmUgYW5kIHJlc3RvcmUgcGFja2FnZXNcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJlc3RvcmUgcGFja2FnZSBzdGF0ZXMgd2hlbiBkZWFjdGl2YXRpbmcgdGhpcyBwYWNrYWdlIChlLmcuIHdoZW4gY2xvc2luZyBBdG9tKVwiLFxyXG4gICAgdHlwZTogXCJib29sZWFuXCIsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICB9LFxyXG4gIFNhdmVEYXRhOiB7XHJcbiAgICB0aXRsZTogXCJQYWNrYWdlIFN0YXRlc1wiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiQXJyYXkgb2YgcGFja2FnZXMgdG8gZGlzYWJsZSB3aGVuIGRlYWN0aXZhdGluZyB0aGlzIHBhY2thZ2VcIixcclxuICAgIHR5cGU6IFwiYXJyYXlcIixcclxuICAgIGRlZmF1bHQ6IFtdLFxyXG4gIH0sXHJcbiAgRGVmZXJJbml0aWFsaXphdGlvbjoge1xyXG4gICAgdGl0bGU6IFwiQWN0aXZhdGlvbiBUaW1lb3V0XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlZmVyIGV4ZWN1dGlvbiBvZiBsb2NhbCBidW5kbGVzXCIsXHJcbiAgICB0eXBlOiBcImludGVnZXJcIixcclxuICAgIGRlZmF1bHQ6IDEwMCxcclxuICB9LFxyXG4gIEludmVydFNhdmVEYXRhOiB7XHJcbiAgICB0aXRsZTogXCJJbnZlcnQgUGFja2FnZSBTdGF0ZXNcIixcclxuICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAnRGlzYWJsZSBBTEwgcGFja2FnZXMgRVhDRVBUIHRob3NlIGluIFwiUGFja2FnZSBTdGF0ZXNcIi4gVGhpcyBpbmNsdWRlcyBjb3JlIHBhY2thZ2VzIGxpa2UgdGFicywgdHJlZS12aWV3IGFuZCBzZXR0aW5ncy12aWV3ISEhJyxcclxuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxyXG4gICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgfSxcclxuICBEaXNhYmxlTGFuZ3VhZ2VQYWNrYWdlczoge1xyXG4gICAgdGl0bGU6IFwiRG8gbm90IGRpc2FibGUgTGFuZ3VhZ2UgUGFja2FnZXNcIixcclxuICAgIGRlc2NyaXB0aW9uOiAnRG8gbm90IGRpc2FibGUgbGFuZ3VhZ2UgcGFja2FnZXMuIE9ubHkgaWYgXCJJbnZlcnQgUGFja2FnZSBTdGF0ZXNcIiBpcyBjaGVja2VkJyxcclxuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxyXG4gICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgfSxcclxufVxyXG5cclxuZnVuY3Rpb24gX19ndWFyZF9fKHZhbHVlLCB0cmFuc2Zvcm0pIHtcclxuICByZXR1cm4gdHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsID8gdHJhbnNmb3JtKHZhbHVlKSA6IHVuZGVmaW5lZFxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVCdW5kbGVWaWV3KCkge1xyXG4gIGlmICghYnVuZGxldmlldyl7XHJcbiAgICBidW5kbGV2aWV3ID0gbmV3IEJ1bmRsZVZpZXcoKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlc1ZpZXcoKSB7XHJcbiAgaWYgKCFidW5kbGVzdmlldyl7XHJcbiAgICBidW5kbGVzdmlldyA9IG5ldyBCdW5kbGVzVmlldygpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVOYW1lVmlldygpIHtcclxuICBpZiAoIW5hbWV2aWV3KXtcclxuICAgIG5hbWV2aWV3ID0gbmV3IE5hbWVWaWV3KClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUJ1bmRsZXNJbnN0YW5jZSgpIHtcclxuICBpZiAoIWJ1bmRsZXMpe1xyXG4gICAgYnVuZGxlcyA9IG5ldyBCdW5kbGVzKClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRQcm9qZWN0Q29uZmlncygpIHtcclxuICBsZXQgcFxyXG4gIGlmICgocCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpKS5sZW5ndGggPT09IDEpIHtcclxuICAgIGxldCBmXHJcbiAgICBmcy5zdGF0KChmID0gcGF0aC5qb2luKHBbMF0sIFwiLnBhY2thZ2Utc3dpdGNoLmNzb25cIikpLCBmdW5jdGlvbiAoZmlsZUVycm9yLCBzdGF0cykge1xyXG4gICAgICBpZiAoZmlsZUVycm9yICYmICFzdGF0cykge1xyXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidHJlZS12aWV3XCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJ0YWJzXCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJzZXR0aW5ncy12aWV3XCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJjb21tYW5kLXBhbGV0dGVcIilcclxuICAgICAgfVxyXG4gICAgICBzZXRUaW1lb3V0KFxyXG4gICAgICAgICgpID0+IG5ldyBJbml0RmlsZShwYXRoLmJhc2VuYW1lKHBbMF0pLCBmKS5leGVjdXRlKGZhbHNlKSxcclxuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoXCJwYWNrYWdlLXN3aXRjaC5EZWZlckluaXRpYWxpemF0aW9uXCIpXHJcbiAgICAgIClcclxuICAgIH0pXHJcbiAgfSBlbHNlIHtcclxuICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidHJlZS12aWV3XCIpXHJcbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcInRhYnNcIilcclxuICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwic2V0dGluZ3Mtdmlld1wiKVxyXG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJjb21tYW5kLXBhbGV0dGVcIilcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvZ2dsZUNhbGxiYWNrKG9wcG9zaXRlLCBidW5kbGUpIHtcclxuICBfX2d1YXJkX18oYnVuZGxlcy5nZXRCdW5kbGUoYnVuZGxlLm5hbWUpLCAoeCkgPT4geC5leGVjdXRlKG9wcG9zaXRlKSlcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQ2FsbGJhY2soYnVuZGxlKSB7XHJcbiAgYnVuZGxlcy5yZW1vdmVCdW5kbGUoYnVuZGxlLm5hbWUpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVTdGF0ZXMoKSB7XHJcbiAgYXRvbS5jb25maWcuc2V0KFxyXG4gICAgXCJwYWNrYWdlLXN3aXRjaC5TYXZlRGF0YVwiLFxyXG4gICAgYXRvbS5jb25maWcuZ2V0KFwiY29yZS5kaXNhYmxlZFBhY2thZ2VzXCIpLmZpbHRlcigoaXRlbSwgaW5kZXgsIGFycmF5KSA9PiBhcnJheS5pbmRleE9mKGl0ZW0pID09PSBpbmRleClcclxuICApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvZ2dsZShvcHBvc2l0ZSA9IGZhbHNlKSB7XHJcbiAgY3JlYXRlQnVuZGxlc0luc3RhbmNlKClcclxuICBjcmVhdGVCdW5kbGVzVmlldygpXHJcbiAgYnVuZGxlc3ZpZXcuc2hvdyhcclxuICAgIGJ1bmRsZXMuZ2V0QnVuZGxlcygpLFxyXG4gICAgKGJ1bmRsZSkgPT4ge1xyXG4gICAgICB0b2dnbGVDYWxsYmFjayhvcHBvc2l0ZSwgYnVuZGxlKVxyXG4gICAgfSxcclxuICAgIG9wcG9zaXRlXHJcbiAgKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoKSB7XHJcbiAgY3JlYXRlQnVuZGxlc0luc3RhbmNlKClcclxuICBjcmVhdGVCdW5kbGVzVmlldygpXHJcbiAgYnVuZGxlc3ZpZXcuc2hvdyhidW5kbGVzLmdldEJ1bmRsZXMoZmFsc2UpLCAoYnVuZGxlKSA9PiByZW1vdmVDYWxsYmFjayhidW5kbGUpKVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYWxsYmFjayhvbGRuYW1lLCBpdGVtcykge1xyXG4gIGNyZWF0ZU5hbWVWaWV3KClcclxuICBuYW1ldmlldy5zaG93KGJ1bmRsZXMsIG9sZG5hbWUsIGl0ZW1zLCB7XHJcbiAgICBjb25maXJtQ2FsbGJhY2s6IChvbGRuYW1lLCBuYW1lLCBwYWNrYWdlcykgPT4ge1xyXG4gICAgICBuYW1lQ2FsbGJhY2sob2xkbmFtZSwgbmFtZSwgcGFja2FnZXMpXHJcbiAgICB9LFxyXG4gICAgYmFja0NhbGxiYWNrOiAob2xkbmFtZSwgX2l0ZW1zKSA9PlxyXG4gICAgICBjcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6IG9sZG5hbWUsXHJcbiAgICAgICAgcGFja2FnZXM6IF9pdGVtcyxcclxuICAgICAgfSksXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gbmFtZUNhbGxiYWNrKG9sZG5hbWUsIG5hbWUsIHBhY2thZ2VzKSB7XHJcbiAgaWYgKG9sZG5hbWUgIT0gbnVsbCkge1xyXG4gICAgYnVuZGxlcy5yZXBsYWNlQnVuZGxlKG9sZG5hbWUsIG5hbWUsIHBhY2thZ2VzKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBidW5kbGVzLmFkZEJ1bmRsZShuYW1lLCBwYWNrYWdlcylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZShidW5kbGUgPSBudWxsKSB7XHJcbiAgY3JlYXRlQnVuZGxlc0luc3RhbmNlKClcclxuICBjcmVhdGVCdW5kbGVWaWV3KClcclxuICBidW5kbGV2aWV3LnNob3coYnVuZGxlLCAob2xkbmFtZSwgaXRlbXMpID0+IGNyZWF0ZUNhbGxiYWNrKG9sZG5hbWUsIGl0ZW1zKSlcclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdCgpIHtcclxuICBjcmVhdGVCdW5kbGVzSW5zdGFuY2UoKVxyXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcclxuICBidW5kbGVzdmlldy5zaG93KGJ1bmRsZXMuZ2V0QnVuZGxlcyhmYWxzZSksIChidW5kbGUpID0+IGNyZWF0ZShidW5kbGUpKVxyXG59XHJcbiJdfQ==