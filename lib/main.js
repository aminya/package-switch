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
    }), atom.commands.add('.tree-view .file .name[data-name$="\\.package-switch\\.json"]', "package-switch:open-local", ({ target }) => atom.workspace.open(target.dataset.path, { noopener: true })), atom.config.onDidChange("package-switch.SaveRestore", ({ newValue }) => {
        if (newValue) {
            saveStates();
        }
    }), atom.workspace.addOpener(function (uritoopen, { noopener }) {
        if (noopener == null) {
            if (uritoopen.endsWith(".package-switch.json")) {
                initfileview = new init_file_view_1.InitFileView({
                    uri: uritoopen,
                    file: new init_file_1.InitFile(path_1.default.dirname(uritoopen), uritoopen),
                });
            }
            else if (uritoopen.endsWith(".package-switch.cson")) {
                console.error("here");
                initfileview = new init_file_view_1.InitFileView({
                    uri: uritoopen,
                    file: new init_file_1.InitFileCSON(path_1.default.dirname(uritoopen), uritoopen),
                });
            }
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
    const p = atom.project.getPaths();
    if (p.length === 1) {
        const f = path_1.default.join(p[0], ".package-switch.json");
        fs_1.default.stat(f, function (fileError, stats) {
            if (fileError && !stats) {
                atom.packages.activatePackage("tree-view");
                atom.packages.activatePackage("tabs");
                atom.packages.activatePackage("settings-view");
                atom.packages.activatePackage("command-palette");
            }
            setTimeout(() => new init_file_1.InitFile(path_1.default.basename(p[0]), f).execute(false), atom.config.get("package-switch.DeferInitialization"));
        });
        const fcson = path_1.default.join(p[0], ".package-switch.cson");
        if (fs_1.default.existsSync(fcson)) {
            fs_1.default.stat(fcson, function (fileError, stats) {
                if (fileError && !stats) {
                    atom.packages.activatePackage("tree-view");
                    atom.packages.activatePackage("tabs");
                    atom.packages.activatePackage("settings-view");
                    atom.packages.activatePackage("command-palette");
                }
                setTimeout(() => new init_file_1.InitFileCSON(path_1.default.basename(p[0]), fcson).execute(false), atom.config.get("package-switch.DeferInitialization"));
            });
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBTUEsK0JBQTBDO0FBQzFDLDRDQUFtQjtBQUNuQixnREFBdUI7QUFDdkIscURBQStDO0FBQy9DLDJDQUFvRDtBQUNwRCwrQ0FBMEM7QUFDMUMsaURBQTRDO0FBQzVDLDJDQUFzQztBQUN0Qyx1Q0FBbUM7QUFFbkMsSUFBSSxPQUFnQixDQUFBO0FBQ3BCLElBQUksVUFBc0IsQ0FBQTtBQUMxQixJQUFJLFdBQXdCLENBQUE7QUFDNUIsSUFBSSxRQUFrQixDQUFBO0FBQ3RCLElBQUksWUFBMEIsQ0FBQTtBQUU5QixJQUFJLGFBQWtDLENBQUE7QUFFdEMsU0FBZ0IsUUFBUTtJQUN0QixrQkFBa0IsRUFBRSxDQUFBO0lBQ3BCLGFBQWEsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFFekMsYUFBYSxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNsQywrQkFBK0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDL0MsOEJBQThCLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNsRCx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7UUFDdkMscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFO1FBQ25DLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTtRQUN2Qyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtRQUN6RyxDQUFD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LENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzdFLENBQUM7QUFFRCxTQUFTLElBQUk7SUFDWCxxQkFBcUIsRUFBRSxDQUFBO0lBQ3ZCLGlCQUFpQixFQUFFLENBQUE7SUFDbkIsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUN6RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogZGVjYWZmZWluYXRlIHN1Z2dlc3Rpb25zOlxyXG4gKiBEUzEwMzogUmV3cml0ZSBjb2RlIHRvIG5vIGxvbmdlciB1c2UgX19ndWFyZF9fXHJcbiAqIERTMjA3OiBDb25zaWRlciBzaG9ydGVyIHZhcmlhdGlvbnMgb2YgbnVsbCBjaGVja3NcclxuICogRnVsbCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vZGVjYWZmZWluYXRlL2RlY2FmZmVpbmF0ZS9ibG9iL21hc3Rlci9kb2NzL3N1Z2dlc3Rpb25zLm1kXHJcbiAqL1xyXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSBcImF0b21cIlxyXG5pbXBvcnQgZnMgZnJvbSBcImZzXCJcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxyXG5pbXBvcnQgeyBJbml0RmlsZVZpZXcgfSBmcm9tIFwiLi9pbml0LWZpbGUtdmlld1wiXHJcbmltcG9ydCB7IEluaXRGaWxlLCBJbml0RmlsZUNTT04gfSBmcm9tIFwiLi9pbml0LWZpbGVcIlxyXG5pbXBvcnQgeyBCdW5kbGVWaWV3IH0gZnJvbSBcIi4vYnVuZGxlLXZpZXdcIlxyXG5pbXBvcnQgeyBCdW5kbGVzVmlldyB9IGZyb20gXCIuL2J1bmRsZXMtdmlld1wiXHJcbmltcG9ydCB7IE5hbWVWaWV3IH0gZnJvbSBcIi4vbmFtZS12aWV3XCJcclxuaW1wb3J0IHsgQnVuZGxlcyB9IGZyb20gXCIuL2J1bmRsZXNcIlxyXG5cclxubGV0IGJ1bmRsZXM6IEJ1bmRsZXNcclxubGV0IGJ1bmRsZXZpZXc6IEJ1bmRsZVZpZXdcclxubGV0IGJ1bmRsZXN2aWV3OiBCdW5kbGVzVmlld1xyXG5sZXQgbmFtZXZpZXc6IE5hbWVWaWV3XHJcbmxldCBpbml0ZmlsZXZpZXc6IEluaXRGaWxlVmlld1xyXG5cclxubGV0IHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGVcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICBsb2FkUHJvamVjdENvbmZpZ3MoKVxyXG4gIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXHJcblxyXG4gIHN1YnNjcmlwdGlvbnMuYWRkKFxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XHJcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6c3RhcnQtcGFja2FnZXNcIjogKCkgPT4gdG9nZ2xlKCksXHJcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6c3RvcC1wYWNrYWdlc1wiOiAoKSA9PiB0b2dnbGUodHJ1ZSksXHJcbiAgICAgIFwicGFja2FnZS1zd2l0Y2g6Y3JlYXRlXCI6ICgpID0+IGNyZWF0ZSgpLFxyXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOmVkaXRcIjogKCkgPT4gZWRpdCgpLFxyXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOnJlbW92ZVwiOiAoKSA9PiByZW1vdmUoKSxcclxuICAgICAgXCJwYWNrYWdlLXN3aXRjaDpvcGVuLWdsb2JhbFwiOiAoKSA9PiB7XHJcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGF0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKCkpLCBcInBhY2thZ2Utc3dpdGNoLmJ1bmRsZXNcIikpXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChcclxuICAgICAgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cIlxcXFwucGFja2FnZS1zd2l0Y2hcXFxcLmpzb25cIl0nLFxyXG4gICAgICBcInBhY2thZ2Utc3dpdGNoOm9wZW4tbG9jYWxcIixcclxuICAgICAgKHsgdGFyZ2V0IH0pID0+IGF0b20ud29ya3NwYWNlLm9wZW4odGFyZ2V0LmRhdGFzZXQucGF0aCwgeyBub29wZW5lcjogdHJ1ZSB9KVxyXG4gICAgKSxcclxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFwicGFja2FnZS1zd2l0Y2guU2F2ZVJlc3RvcmVcIiwgKHsgbmV3VmFsdWUgfSkgPT4ge1xyXG4gICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICBzYXZlU3RhdGVzKClcclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIoZnVuY3Rpb24gKHVyaXRvb3BlbiwgeyBub29wZW5lciB9KSB7XHJcbiAgICAgIGlmIChub29wZW5lciA9PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHVyaXRvb3Blbi5lbmRzV2l0aChcIi5wYWNrYWdlLXN3aXRjaC5qc29uXCIpKSB7XHJcbiAgICAgICAgICBpbml0ZmlsZXZpZXcgPSBuZXcgSW5pdEZpbGVWaWV3KHtcclxuICAgICAgICAgICAgdXJpOiB1cml0b29wZW4sXHJcbiAgICAgICAgICAgIGZpbGU6IG5ldyBJbml0RmlsZShwYXRoLmRpcm5hbWUodXJpdG9vcGVuKSwgdXJpdG9vcGVuKSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRlcHJlY2F0ZWRcclxuICAgICAgICBlbHNlIGlmICh1cml0b29wZW4uZW5kc1dpdGgoXCIucGFja2FnZS1zd2l0Y2guY3NvblwiKSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImhlcmVcIilcclxuICAgICAgICAgIGluaXRmaWxldmlldyA9IG5ldyBJbml0RmlsZVZpZXcoe1xyXG4gICAgICAgICAgICB1cmk6IHVyaXRvb3BlbixcclxuICAgICAgICAgICAgZmlsZTogbmV3IEluaXRGaWxlQ1NPTihwYXRoLmRpcm5hbWUodXJpdG9vcGVuKSwgdXJpdG9vcGVuKSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XHJcbiAgaWYgKGF0b20uY29uZmlnLmdldChcInBhY2thZ2Utc3dpdGNoLlNhdmVSZXN0b3JlXCIpKSB7XHJcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guSW52ZXJ0U2F2ZURhdGFcIikpIHtcclxuICAgICAgY29uc3QgbHAgPSBhdG9tLmNvbmZpZy5nZXQoXCJwYWNrYWdlLXN3aXRjaC5EaXNhYmxlTGFuZ3VhZ2VQYWNrYWdlc1wiKVxyXG4gICAgICBjb25zdCBzYXZlRGF0YSA9IGF0b20uY29uZmlnLmdldChcInBhY2thZ2Utc3dpdGNoLlNhdmVEYXRhXCIpXHJcbiAgICAgIGNvbnN0IGRpc2FibGVkUGFja2FnZXMgPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHAgb2YgYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKSkge1xyXG4gICAgICAgIGlmIChwID09PSBcInBhY2thZ2Utc3dpdGNoXCIpIHtcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzYXZlRGF0YS5pbmNsdWRlcyhwKSkge1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxwICYmIHAuc3RhcnRzV2l0aChcImxhbmd1YWdlLVwiKSkge1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZGlzYWJsZWRQYWNrYWdlcy5wdXNoKHApXHJcbiAgICAgIH1cclxuICAgICAgYXRvbS5jb25maWcuc2V0KFwiY29yZS5kaXNhYmxlZFBhY2thZ2VzXCIsIGRpc2FibGVkUGFja2FnZXMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJjb3JlLmRpc2FibGVkUGFja2FnZXNcIiwgYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guU2F2ZURhdGFcIikpXHJcbiAgICB9XHJcbiAgICBhdG9tLmNvbmZpZy5zYXZlKClcclxuICB9XHJcbiAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcclxuICBpZiAoYnVuZGxlcykge1xyXG4gICAgYnVuZGxlcy5kZXN0cm95KClcclxuICB9XHJcbiAgaWYgKG5hbWV2aWV3KSB7XHJcbiAgICBuYW1ldmlldy5kZXN0cm95KClcclxuICB9XHJcbiAgaWYgKGluaXRmaWxldmlldykge1xyXG4gICAgaW5pdGZpbGV2aWV3LmRlc3Ryb3koKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcclxuICBTYXZlUmVzdG9yZToge1xyXG4gICAgdGl0bGU6IFwiU2F2ZSBhbmQgcmVzdG9yZSBwYWNrYWdlc1wiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiUmVzdG9yZSBwYWNrYWdlIHN0YXRlcyB3aGVuIGRlYWN0aXZhdGluZyB0aGlzIHBhY2thZ2UgKGUuZy4gd2hlbiBjbG9zaW5nIEF0b20pXCIsXHJcbiAgICB0eXBlOiBcImJvb2xlYW5cIixcclxuICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gIH0sXHJcbiAgU2F2ZURhdGE6IHtcclxuICAgIHRpdGxlOiBcIlBhY2thZ2UgU3RhdGVzXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJBcnJheSBvZiBwYWNrYWdlcyB0byBkaXNhYmxlIHdoZW4gZGVhY3RpdmF0aW5nIHRoaXMgcGFja2FnZVwiLFxyXG4gICAgdHlwZTogXCJhcnJheVwiLFxyXG4gICAgZGVmYXVsdDogW10sXHJcbiAgfSxcclxuICBEZWZlckluaXRpYWxpemF0aW9uOiB7XHJcbiAgICB0aXRsZTogXCJBY3RpdmF0aW9uIFRpbWVvdXRcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIk51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVmZXIgZXhlY3V0aW9uIG9mIGxvY2FsIGJ1bmRsZXNcIixcclxuICAgIHR5cGU6IFwiaW50ZWdlclwiLFxyXG4gICAgZGVmYXVsdDogMTAwLFxyXG4gIH0sXHJcbiAgSW52ZXJ0U2F2ZURhdGE6IHtcclxuICAgIHRpdGxlOiBcIkludmVydCBQYWNrYWdlIFN0YXRlc1wiLFxyXG4gICAgZGVzY3JpcHRpb246XHJcbiAgICAgICdEaXNhYmxlIEFMTCBwYWNrYWdlcyBFWENFUFQgdGhvc2UgaW4gXCJQYWNrYWdlIFN0YXRlc1wiLiBUaGlzIGluY2x1ZGVzIGNvcmUgcGFja2FnZXMgbGlrZSB0YWJzLCB0cmVlLXZpZXcgYW5kIHNldHRpbmdzLXZpZXchISEnLFxyXG4gICAgdHlwZTogXCJib29sZWFuXCIsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICB9LFxyXG4gIERpc2FibGVMYW5ndWFnZVBhY2thZ2VzOiB7XHJcbiAgICB0aXRsZTogXCJEbyBub3QgZGlzYWJsZSBMYW5ndWFnZSBQYWNrYWdlc1wiLFxyXG4gICAgZGVzY3JpcHRpb246ICdEbyBub3QgZGlzYWJsZSBsYW5ndWFnZSBwYWNrYWdlcy4gT25seSBpZiBcIkludmVydCBQYWNrYWdlIFN0YXRlc1wiIGlzIGNoZWNrZWQnLFxyXG4gICAgdHlwZTogXCJib29sZWFuXCIsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICB9LFxyXG59XHJcblxyXG5mdW5jdGlvbiBfX2d1YXJkX18odmFsdWUsIHRyYW5zZm9ybSkge1xyXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwgPyB0cmFuc2Zvcm0odmFsdWUpIDogdW5kZWZpbmVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUJ1bmRsZVZpZXcoKSB7XHJcbiAgaWYgKCFidW5kbGV2aWV3KSB7XHJcbiAgICBidW5kbGV2aWV3ID0gbmV3IEJ1bmRsZVZpZXcoKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlc1ZpZXcoKSB7XHJcbiAgaWYgKCFidW5kbGVzdmlldykge1xyXG4gICAgYnVuZGxlc3ZpZXcgPSBuZXcgQnVuZGxlc1ZpZXcoKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlTmFtZVZpZXcoKSB7XHJcbiAgaWYgKCFuYW1ldmlldykge1xyXG4gICAgbmFtZXZpZXcgPSBuZXcgTmFtZVZpZXcoKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlc0luc3RhbmNlKCkge1xyXG4gIGlmICghYnVuZGxlcykge1xyXG4gICAgYnVuZGxlcyA9IG5ldyBCdW5kbGVzKClcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRQcm9qZWN0Q29uZmlncygpIHtcclxuICBjb25zdCBwID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcclxuICBpZiAocC5sZW5ndGggPT09IDEpIHtcclxuICAgIGNvbnN0IGYgPSBwYXRoLmpvaW4ocFswXSwgXCIucGFja2FnZS1zd2l0Y2guanNvblwiKVxyXG4gICAgZnMuc3RhdChmLCBmdW5jdGlvbiAoZmlsZUVycm9yLCBzdGF0cykge1xyXG4gICAgICBpZiAoZmlsZUVycm9yICYmICFzdGF0cykge1xyXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidHJlZS12aWV3XCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJ0YWJzXCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJzZXR0aW5ncy12aWV3XCIpXHJcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJjb21tYW5kLXBhbGV0dGVcIilcclxuICAgICAgfVxyXG4gICAgICBzZXRUaW1lb3V0KFxyXG4gICAgICAgICgpID0+IG5ldyBJbml0RmlsZShwYXRoLmJhc2VuYW1lKHBbMF0pLCBmKS5leGVjdXRlKGZhbHNlKSxcclxuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoXCJwYWNrYWdlLXN3aXRjaC5EZWZlckluaXRpYWxpemF0aW9uXCIpXHJcbiAgICAgIClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gZGVwcmVjYXRlZFxyXG4gICAgY29uc3QgZmNzb24gPSBwYXRoLmpvaW4ocFswXSwgXCIucGFja2FnZS1zd2l0Y2guY3NvblwiKVxyXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZmNzb24pKSB7XHJcbiAgICAgIGZzLnN0YXQoZmNzb24sIGZ1bmN0aW9uIChmaWxlRXJyb3IsIHN0YXRzKSB7XHJcbiAgICAgICAgaWYgKGZpbGVFcnJvciAmJiAhc3RhdHMpIHtcclxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidHJlZS12aWV3XCIpXHJcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcInRhYnNcIilcclxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwic2V0dGluZ3Mtdmlld1wiKVxyXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJjb21tYW5kLXBhbGV0dGVcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0VGltZW91dChcclxuICAgICAgICAgICgpID0+IG5ldyBJbml0RmlsZUNTT04ocGF0aC5iYXNlbmFtZShwWzBdKSwgZmNzb24pLmV4ZWN1dGUoZmFsc2UpLFxyXG4gICAgICAgICAgYXRvbS5jb25maWcuZ2V0KFwicGFja2FnZS1zd2l0Y2guRGVmZXJJbml0aWFsaXphdGlvblwiKVxyXG4gICAgICAgIClcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJ0cmVlLXZpZXdcIilcclxuICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwidGFic1wiKVxyXG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJzZXR0aW5ncy12aWV3XCIpXHJcbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcImNvbW1hbmQtcGFsZXR0ZVwiKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9nZ2xlQ2FsbGJhY2sob3Bwb3NpdGUsIGJ1bmRsZSkge1xyXG4gIF9fZ3VhcmRfXyhidW5kbGVzLmdldEJ1bmRsZShidW5kbGUubmFtZSksICh4KSA9PiB4LmV4ZWN1dGUob3Bwb3NpdGUpKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVDYWxsYmFjayhidW5kbGUpIHtcclxuICBidW5kbGVzLnJlbW92ZUJ1bmRsZShidW5kbGUubmFtZSlcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZVN0YXRlcygpIHtcclxuICBhdG9tLmNvbmZpZy5zZXQoXHJcbiAgICBcInBhY2thZ2Utc3dpdGNoLlNhdmVEYXRhXCIsXHJcbiAgICBhdG9tLmNvbmZpZy5nZXQoXCJjb3JlLmRpc2FibGVkUGFja2FnZXNcIikuZmlsdGVyKChpdGVtLCBpbmRleCwgYXJyYXkpID0+IGFycmF5LmluZGV4T2YoaXRlbSkgPT09IGluZGV4KVxyXG4gIClcclxufVxyXG5cclxuZnVuY3Rpb24gdG9nZ2xlKG9wcG9zaXRlID0gZmFsc2UpIHtcclxuICBjcmVhdGVCdW5kbGVzSW5zdGFuY2UoKVxyXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcclxuICBidW5kbGVzdmlldy5zaG93KFxyXG4gICAgYnVuZGxlcy5nZXRCdW5kbGVzKCksXHJcbiAgICAoYnVuZGxlKSA9PiB7XHJcbiAgICAgIHRvZ2dsZUNhbGxiYWNrKG9wcG9zaXRlLCBidW5kbGUpXHJcbiAgICB9LFxyXG4gICAgb3Bwb3NpdGVcclxuICApXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZSgpIHtcclxuICBjcmVhdGVCdW5kbGVzSW5zdGFuY2UoKVxyXG4gIGNyZWF0ZUJ1bmRsZXNWaWV3KClcclxuICBidW5kbGVzdmlldy5zaG93KGJ1bmRsZXMuZ2V0QnVuZGxlcyhmYWxzZSksIChidW5kbGUpID0+IHJlbW92ZUNhbGxiYWNrKGJ1bmRsZSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKG9sZG5hbWUsIGl0ZW1zKSB7XHJcbiAgY3JlYXRlTmFtZVZpZXcoKVxyXG4gIG5hbWV2aWV3LnNob3coYnVuZGxlcywgb2xkbmFtZSwgaXRlbXMsIHtcclxuICAgIGNvbmZpcm1DYWxsYmFjazogKG9sZG5hbWUsIG5hbWUsIHBhY2thZ2VzKSA9PiB7XHJcbiAgICAgIG5hbWVDYWxsYmFjayhvbGRuYW1lLCBuYW1lLCBwYWNrYWdlcylcclxuICAgIH0sXHJcbiAgICBiYWNrQ2FsbGJhY2s6IChvbGRuYW1lLCBfaXRlbXMpID0+XHJcbiAgICAgIGNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogb2xkbmFtZSxcclxuICAgICAgICBwYWNrYWdlczogX2l0ZW1zLFxyXG4gICAgICB9KSxcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBuYW1lQ2FsbGJhY2sob2xkbmFtZSwgbmFtZSwgcGFja2FnZXMpIHtcclxuICBpZiAob2xkbmFtZSAhPSBudWxsKSB7XHJcbiAgICBidW5kbGVzLnJlcGxhY2VCdW5kbGUob2xkbmFtZSwgbmFtZSwgcGFja2FnZXMpXHJcbiAgfSBlbHNlIHtcclxuICAgIGJ1bmRsZXMuYWRkQnVuZGxlKG5hbWUsIHBhY2thZ2VzKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlKGJ1bmRsZSA9IG51bGwpIHtcclxuICBjcmVhdGVCdW5kbGVzSW5zdGFuY2UoKVxyXG4gIGNyZWF0ZUJ1bmRsZVZpZXcoKVxyXG4gIGJ1bmRsZXZpZXcuc2hvdyhidW5kbGUsIChvbGRuYW1lLCBpdGVtcykgPT4gY3JlYXRlQ2FsbGJhY2sob2xkbmFtZSwgaXRlbXMpKVxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0KCkge1xyXG4gIGNyZWF0ZUJ1bmRsZXNJbnN0YW5jZSgpXHJcbiAgY3JlYXRlQnVuZGxlc1ZpZXcoKVxyXG4gIGJ1bmRsZXN2aWV3LnNob3coYnVuZGxlcy5nZXRCdW5kbGVzKGZhbHNlKSwgKGJ1bmRsZSkgPT4gY3JlYXRlKGJ1bmRsZSkpXHJcbn1cclxuIl19