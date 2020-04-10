"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const season_1 = __importDefault(require("season"));
class InitFile {
    constructor(name, filepath) {
        this.name = name;
        this.filepath = filepath;
        try {
            this.packages = season_1.default.readFileSync(this.filepath);
            if (this.packages == null) {
                this.packages = [];
            }
        }
        catch (error) {
            this.packages = [];
        }
    }
    execute(opposite) {
        return this.packages.map((p) => opposite
            ? p.action === "removed"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name)
            : p.action === "added"
                ? atom.packages.enablePackage(p.name)
                : atom.packages.disablePackage(p.name));
    }
    save() {
        try {
            return season_1.default.writeFileSync(this.filepath, this.packages);
        }
        catch (error) { }
    }
}
exports.InitFile = InitFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC1maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luaXQtZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQU1BLG9EQUF5QjtBQUV6QixNQUFhLFFBQVE7SUFDbkIsWUFBWSxJQUFJLEVBQUUsUUFBUTtRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJO1lBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDaEQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7YUFDbkI7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7U0FDbkI7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLFFBQVE7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDN0IsUUFBUTtZQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQTtJQUNILENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSTtZQUNGLE9BQU8sZ0JBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDeEQ7UUFBQyxPQUFPLEtBQUssRUFBRSxHQUFFO0lBQ3BCLENBQUM7Q0FDRjtBQS9CRCw0QkErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBkZWNhZmZlaW5hdGUgc3VnZ2VzdGlvbnM6XHJcbiAqIERTMTAyOiBSZW1vdmUgdW5uZWNlc3NhcnkgY29kZSBjcmVhdGVkIGJlY2F1c2Ugb2YgaW1wbGljaXQgcmV0dXJuc1xyXG4gKiBEUzIwNzogQ29uc2lkZXIgc2hvcnRlciB2YXJpYXRpb25zIG9mIG51bGwgY2hlY2tzXHJcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxyXG4gKi9cclxuaW1wb3J0IENTT04gZnJvbSBcInNlYXNvblwiXHJcblxyXG5leHBvcnQgY2xhc3MgSW5pdEZpbGUge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIGZpbGVwYXRoKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmZpbGVwYXRoID0gZmlsZXBhdGhcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBDU09OLnJlYWRGaWxlU3luYyh0aGlzLmZpbGVwYXRoKVxyXG4gICAgICBpZiAodGhpcy5wYWNrYWdlcyA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5wYWNrYWdlcyA9IFtdXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRoaXMucGFja2FnZXMgPSBbXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZShvcHBvc2l0ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMucGFja2FnZXMubWFwKChwKSA9PlxyXG4gICAgICBvcHBvc2l0ZVxyXG4gICAgICAgID8gcC5hY3Rpb24gPT09IFwicmVtb3ZlZFwiXHJcbiAgICAgICAgICA/IGF0b20ucGFja2FnZXMuZW5hYmxlUGFja2FnZShwLm5hbWUpXHJcbiAgICAgICAgICA6IGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UocC5uYW1lKVxyXG4gICAgICAgIDogcC5hY3Rpb24gPT09IFwiYWRkZWRcIlxyXG4gICAgICAgID8gYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKHAubmFtZSlcclxuICAgICAgICA6IGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UocC5uYW1lKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgc2F2ZSgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBDU09OLndyaXRlRmlsZVN5bmModGhpcy5maWxlcGF0aCwgdGhpcy5wYWNrYWdlcylcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxyXG4gIH1cclxufVxyXG4iXX0=