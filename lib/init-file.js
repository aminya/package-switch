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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC1maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2luaXQtZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQU1BLG9EQUF5QjtBQUV6QixNQUFhLFFBQVE7SUFDbkIsWUFBWSxJQUFJLEVBQUUsUUFBUTtRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJO1lBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDaEQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7YUFDbkI7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7U0FDbkI7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLFFBQVE7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDN0IsUUFBUTtZQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVM7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQTtJQUNILENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSTtZQUNGLE9BQU8sZ0JBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDeEQ7UUFBQyxPQUFPLEtBQUssRUFBRSxHQUFFO0lBQ3BCLENBQUM7Q0FDRjtBQS9CRCw0QkErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogZGVjYWZmZWluYXRlIHN1Z2dlc3Rpb25zOlxuICogRFMxMDI6IFJlbW92ZSB1bm5lY2Vzc2FyeSBjb2RlIGNyZWF0ZWQgYmVjYXVzZSBvZiBpbXBsaWNpdCByZXR1cm5zXG4gKiBEUzIwNzogQ29uc2lkZXIgc2hvcnRlciB2YXJpYXRpb25zIG9mIG51bGwgY2hlY2tzXG4gKiBGdWxsIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZWNhZmZlaW5hdGUvZGVjYWZmZWluYXRlL2Jsb2IvbWFzdGVyL2RvY3Mvc3VnZ2VzdGlvbnMubWRcbiAqL1xuaW1wb3J0IENTT04gZnJvbSBcInNlYXNvblwiXG5cbmV4cG9ydCBjbGFzcyBJbml0RmlsZSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIGZpbGVwYXRoKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuZmlsZXBhdGggPSBmaWxlcGF0aFxuICAgIHRyeSB7XG4gICAgICB0aGlzLnBhY2thZ2VzID0gQ1NPTi5yZWFkRmlsZVN5bmModGhpcy5maWxlcGF0aClcbiAgICAgIGlmICh0aGlzLnBhY2thZ2VzID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYWNrYWdlcyA9IFtdXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucGFja2FnZXMgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUob3Bwb3NpdGUpIHtcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlcy5tYXAoKHApID0+XG4gICAgICBvcHBvc2l0ZVxuICAgICAgICA/IHAuYWN0aW9uID09PSBcInJlbW92ZWRcIlxuICAgICAgICAgID8gYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKHAubmFtZSlcbiAgICAgICAgICA6IGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UocC5uYW1lKVxuICAgICAgICA6IHAuYWN0aW9uID09PSBcImFkZGVkXCJcbiAgICAgICAgPyBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UocC5uYW1lKVxuICAgICAgICA6IGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UocC5uYW1lKVxuICAgIClcbiAgfVxuXG4gIHNhdmUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBDU09OLndyaXRlRmlsZVN5bmModGhpcy5maWxlcGF0aCwgdGhpcy5wYWNrYWdlcylcbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgfVxufVxuIl19