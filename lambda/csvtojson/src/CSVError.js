"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CSVError extends Error {
    constructor(err, line, extra) {
        super("Error: " + err + ". JSON Line number: " + line + (extra ? " near: " + extra : ""));
        this.err = err;
        this.line = line;
        this.extra = extra;
        this.name = "CSV Parse Error";
    }
    static column_mismatched(index, extra) {
        return new CSVError("column_mismatched", index, extra);
    }
    static unclosed_quote(index, extra) {
        return new CSVError("unclosed_quote", index, extra);
    }
    static fromJSON(obj) {
        return new CSVError(obj.err, obj.line, obj.extra);
    }
    toJSON() {
        return {
            err: this.err,
            line: this.line,
            extra: this.extra
        };
    }
}
exports.default = CSVError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1NWRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDU1ZFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQXFCLFFBQVMsU0FBUSxLQUFLO0lBVXpDLFlBQ1MsR0FBVyxFQUNYLElBQVksRUFDWixLQUFjO1FBRXJCLEtBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLHNCQUFzQixHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUpuRixRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQ1gsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFVBQUssR0FBTCxLQUFLLENBQVM7UUFHckIsSUFBSSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0lBaEJELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsS0FBYztRQUNwRCxPQUFPLElBQUksUUFBUSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFhLEVBQUUsS0FBYztRQUNqRCxPQUFPLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1FBQ2pCLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBU0QsTUFBTTtRQUNKLE9BQU87WUFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDbEIsQ0FBQTtJQUNILENBQUM7Q0FFRjtBQTFCRCwyQkEwQkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBDU1ZFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgc3RhdGljIGNvbHVtbl9taXNtYXRjaGVkKGluZGV4OiBudW1iZXIsIGV4dHJhPzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBDU1ZFcnJvcihcImNvbHVtbl9taXNtYXRjaGVkXCIsIGluZGV4LCBleHRyYSk7XG4gIH1cbiAgc3RhdGljIHVuY2xvc2VkX3F1b3RlKGluZGV4OiBudW1iZXIsIGV4dHJhPzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBDU1ZFcnJvcihcInVuY2xvc2VkX3F1b3RlXCIsIGluZGV4LCBleHRyYSk7XG4gIH1cbiAgc3RhdGljIGZyb21KU09OKG9iaikge1xuICAgIHJldHVybiBuZXcgQ1NWRXJyb3Iob2JqLmVyciwgb2JqLmxpbmUsIG9iai5leHRyYSk7XG4gIH1cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVycjogc3RyaW5nLFxuICAgIHB1YmxpYyBsaW5lOiBudW1iZXIsXG4gICAgcHVibGljIGV4dHJhPzogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKFwiRXJyb3I6IFwiICsgZXJyICsgXCIuIEpTT04gTGluZSBudW1iZXI6IFwiICsgbGluZSArIChleHRyYSA/IFwiIG5lYXI6IFwiICsgZXh0cmEgOiBcIlwiKSk7XG4gICAgdGhpcy5uYW1lID0gXCJDU1YgUGFyc2UgRXJyb3JcIjtcbiAgfVxuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVycjogdGhpcy5lcnIsXG4gICAgICBsaW5lOiB0aGlzLmxpbmUsXG4gICAgICBleHRyYTogdGhpcy5leHRyYVxuICAgIH1cbiAgfVxuXG59XG4iXX0=