"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class InitFile {
    constructor(name, filepath) {
        this.name = name;
        this.filepath = filepath;
        try {
            this.packages = JSON.parse(fs_1.default.readFileSync(this.filepath));
            if (this.packages == null) {
                this.packages = [];
            }
        }
        catch (error) {
            atom.notifications.addError(error);
            this.packages = [];
        }
    }
    execute(opposite) {
        this.packages.map((p) => opposite
            ? p.action === "removed"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name)
            : p.action === "added"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name));
    }
    save() {
        try {
            fs_1.default.writeFileSync(this.filepath, JSON.stringify(this.packages, null, '\t'));
        }
        catch (error) {
            atom.notifications.addError(error);
        }
    }
}
exports.InitFile = InitFile;
let CSON;
class InitFileCSON {
    constructor(name, filepath) {
        atom.notifications.addWarning(`Using CSON config for package-switch is deprecated. 
    Convert ${filepath} to JSON at https://decaffeinate-project.org/repl/`);
        Promise.resolve().then(() => __importStar(require("season"))).then((csonloaded) => {
            CSON = csonloaded;
        });
        this.name = name;
        this.filepath = filepath;
        try {
            this.packages = CSON.readFileSync(this.filepath);
            if (this.packages == null) {
                this.packages = [];
            }
        }
        catch (error) {
            this.packages = [];
        }
    }
    execute(opposite) {
        this.packages.map((p) => opposite
            ? p.action === "removed"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name)
            : p.action === "added"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name));
    }
    save() {
        try {
            CSON.writeFileSync(this.filepath, this.packages);
        }
        catch (error) { }
    }
}
exports.InitFileCSON = InitFileCSON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC1maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luaXQtZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFNQSw0Q0FBbUI7QUFFbkIsTUFBYSxRQUFRO0lBQ25CLFlBQVksSUFBSSxFQUFFLFFBQVE7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDeEIsSUFBSTtZQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1lBQzFELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO2FBQ25CO1NBQ0Y7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO1NBQ25CO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxRQUFRO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUN0QixRQUFRO1lBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUztnQkFDdEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU87Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUN6QyxDQUFBO0lBQ0gsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJO1lBQ0YsWUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtTQUMzRTtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDbkM7SUFDSCxDQUFDO0NBQ0Y7QUFsQ0QsNEJBa0NDO0FBR0QsSUFBSSxJQUFJLENBQUE7QUFDUixNQUFhLFlBQVk7SUFDdkIsWUFBWSxJQUFJLEVBQUUsUUFBUTtRQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztjQUNwQixRQUFRLG9EQUFvRCxDQUFDLENBQUE7UUFHdkUsa0RBQU8sUUFBUSxJQUFFLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ25DLElBQUksR0FBRyxVQUFVLENBQUE7UUFDbkIsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJO1lBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNoRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTthQUNuQjtTQUNGO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtTQUNuQjtJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsUUFBUTtRQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDdEIsUUFBUTtZQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQTtJQUNILENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSTtZQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDakQ7UUFBQyxPQUFPLEtBQUssRUFBRSxHQUFFO0lBQ3BCLENBQUM7Q0FDRjtBQXZDRCxvQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBkZWNhZmZlaW5hdGUgc3VnZ2VzdGlvbnM6XHJcbiAqIERTMTAyOiBSZW1vdmUgdW5uZWNlc3NhcnkgY29kZSBjcmVhdGVkIGJlY2F1c2Ugb2YgaW1wbGljaXQgcmV0dXJuc1xyXG4gKiBEUzIwNzogQ29uc2lkZXIgc2hvcnRlciB2YXJpYXRpb25zIG9mIG51bGwgY2hlY2tzXHJcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxyXG4gKi9cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiXHJcblxyXG5leHBvcnQgY2xhc3MgSW5pdEZpbGUge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIGZpbGVwYXRoKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmZpbGVwYXRoID0gZmlsZXBhdGhcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh0aGlzLmZpbGVwYXRoKSlcclxuICAgICAgaWYgKHRoaXMucGFja2FnZXMgPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMucGFja2FnZXMgPSBbXVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IpXHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBbXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZShvcHBvc2l0ZSkge1xyXG4gICAgdGhpcy5wYWNrYWdlcy5tYXAoKHApID0+XHJcbiAgICAgIG9wcG9zaXRlXHJcbiAgICAgICAgPyBwLmFjdGlvbiA9PT0gXCJyZW1vdmVkXCJcclxuICAgICAgICAgID8gYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKHAubmFtZSlcclxuICAgICAgICAgIDogYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZShwLm5hbWUpXHJcbiAgICAgICAgOiBwLmFjdGlvbiA9PT0gXCJhZGRlZFwiXHJcbiAgICAgICAgPyBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UocC5uYW1lKVxyXG4gICAgICAgIDogYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZShwLm5hbWUpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBzYXZlKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmZpbGVwYXRoLCBKU09OLnN0cmluZ2lmeSh0aGlzLnBhY2thZ2VzLCBudWxsLCAnXFx0JykpXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBkZXByZWNhdGVkXHJcbmxldCBDU09OXHJcbmV4cG9ydCBjbGFzcyBJbml0RmlsZUNTT04ge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIGZpbGVwYXRoKSB7XHJcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhgVXNpbmcgQ1NPTiBjb25maWcgZm9yIHBhY2thZ2Utc3dpdGNoIGlzIGRlcHJlY2F0ZWQuIFxyXG4gICAgQ29udmVydCAke2ZpbGVwYXRofSB0byBKU09OIGF0IGh0dHBzOi8vZGVjYWZmZWluYXRlLXByb2plY3Qub3JnL3JlcGwvYClcclxuXHJcbiAgICAvLyBEeW5hbWljIGltcG9ydCBodHRwczovL21hcml1c3NjaHVsei5jb20vYmxvZy9keW5hbWljLWltcG9ydC1leHByZXNzaW9ucy1pbi10eXBlc2NyaXB0XHJcbiAgICBpbXBvcnQoXCJzZWFzb25cIikudGhlbigoY3NvbmxvYWRlZCkgPT4ge1xyXG4gICAgICBDU09OID0gY3NvbmxvYWRlZFxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmZpbGVwYXRoID0gZmlsZXBhdGhcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBDU09OLnJlYWRGaWxlU3luYyh0aGlzLmZpbGVwYXRoKVxyXG4gICAgICBpZiAodGhpcy5wYWNrYWdlcyA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlcyA9IFtdXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBbXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZShvcHBvc2l0ZSkge1xyXG4gICAgdGhpcy5wYWNrYWdlcy5tYXAoKHApID0+XHJcbiAgICAgIG9wcG9zaXRlXHJcbiAgICAgICAgPyBwLmFjdGlvbiA9PT0gXCJyZW1vdmVkXCJcclxuICAgICAgICAgID8gYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKHAubmFtZSlcclxuICAgICAgICAgIDogYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZShwLm5hbWUpXHJcbiAgICAgICAgOiBwLmFjdGlvbiA9PT0gXCJhZGRlZFwiXHJcbiAgICAgICAgPyBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UocC5uYW1lKVxyXG4gICAgICAgIDogYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZShwLm5hbWUpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICBzYXZlKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgQ1NPTi53cml0ZUZpbGVTeW5jKHRoaXMuZmlsZXBhdGgsIHRoaXMucGFja2FnZXMpXHJcbiAgICB9IGNhdGNoIChlcnJvcikge31cclxuICB9XHJcbn1cclxuIl19