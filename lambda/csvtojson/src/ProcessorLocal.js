"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessorLocal = void 0;
const Processor_1 = require("./Processor");
const bluebird_1 = require("bluebird");
const dataClean_1 = require("./dataClean");
const getEol_1 = require("./getEol");
const fileline_1 = require("./fileline");
const util_1 = require("./util");
const rowSplit_1 = require("./rowSplit");
const lineToJson_1 = require("./lineToJson");
const CSVError_1 = require("./CSVError");
class ProcessorLocal extends Processor_1.Processor {
    constructor() {
        super(...arguments);
        this.rowSplit = new rowSplit_1.RowSplit(this.converter);
        this.eolEmitted = false;
        this._needEmitEol = undefined;
        this.headEmitted = false;
        this._needEmitHead = undefined;
    }
    flush() {
        if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
            const buf = this.runtime.csvLineBuffer;
            this.runtime.csvLineBuffer = undefined;
            return this.process(buf, true)
                .then((res) => {
                if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
                    return bluebird_1.default.reject(CSVError_1.default.unclosed_quote(this.runtime.parsedLineNumber, this.runtime.csvLineBuffer.toString()));
                }
                else {
                    return bluebird_1.default.resolve(res);
                }
            });
        }
        else {
            return bluebird_1.default.resolve([]);
        }
    }
    destroy() {
        return bluebird_1.default.resolve();
    }
    get needEmitEol() {
        if (this._needEmitEol === undefined) {
            this._needEmitEol = this.converter.listeners("eol").length > 0;
        }
        return this._needEmitEol;
    }
    get needEmitHead() {
        if (this._needEmitHead === undefined) {
            this._needEmitHead = this.converter.listeners("header").length > 0;
        }
        return this._needEmitHead;
    }
    process(chunk, finalChunk = false) {
        let csvString;
        if (finalChunk) {
            csvString = chunk.toString();
        }
        else {
            csvString = dataClean_1.prepareData(chunk, this.converter.parseRuntime);
        }
        return bluebird_1.default.resolve()
            .then(() => {
            if (this.runtime.preRawDataHook) {
                return this.runtime.preRawDataHook(csvString);
            }
            else {
                return csvString;
            }
        })
            .then((csv) => {
            if (csv && csv.length > 0) {
                return this.processCSV(csv, finalChunk);
            }
            else {
                return bluebird_1.default.resolve([]);
            }
        });
    }
    processCSV(csv, finalChunk) {
        const params = this.params;
        const runtime = this.runtime;
        if (!runtime.eol) {
            getEol_1.default(csv, runtime);
        }
        if (this.needEmitEol && !this.eolEmitted && runtime.eol) {
            this.converter.emit("eol", runtime.eol);
            this.eolEmitted = true;
        }
        // trim csv file has initial blank lines.
        if (params.ignoreEmpty && !runtime.started) {
            csv = util_1.trimLeft(csv);
        }
        const stringToLineResult = fileline_1.stringToLines(csv, runtime);
        if (!finalChunk) {
            this.prependLeftBuf(util_1.bufFromString(stringToLineResult.partial));
        }
        else {
            stringToLineResult.lines.push(stringToLineResult.partial);
            stringToLineResult.partial = "";
        }
        if (stringToLineResult.lines.length > 0) {
            let prom;
            if (runtime.preFileLineHook) {
                prom = this.runPreLineHook(stringToLineResult.lines);
            }
            else {
                prom = bluebird_1.default.resolve(stringToLineResult.lines);
            }
            return prom.then((lines) => {
                if (!runtime.started
                    && !this.runtime.headers) {
                    return this.processDataWithHead(lines);
                }
                else {
                    return this.processCSVBody(lines);
                }
            });
        }
        else {
            return bluebird_1.default.resolve([]);
        }
    }
    processDataWithHead(lines) {
        if (this.params.noheader) {
            if (this.params.headers) {
                this.runtime.headers = this.params.headers;
            }
            else {
                this.runtime.headers = [];
            }
        }
        else {
            let left = "";
            let headerRow = [];
            while (lines.length) {
                const line = left + lines.shift();
                const row = this.rowSplit.parse(line);
                if (row.closed) {
                    headerRow = row.cells;
                    left = "";
                    break;
                }
                else {
                    left = line + getEol_1.default(line, this.runtime);
                }
            }
            this.prependLeftBuf(util_1.bufFromString(left));
            if (headerRow.length === 0) {
                return [];
            }
            if (this.params.headers) {
                this.runtime.headers = this.params.headers;
            }
            else {
                this.runtime.headers = headerRow;
            }
        }
        if (this.runtime.needProcessIgnoreColumn || this.runtime.needProcessIncludeColumn) {
            this.filterHeader();
        }
        if (this.needEmitHead && !this.headEmitted) {
            this.converter.emit("header", this.runtime.headers);
            this.headEmitted = true;
        }
        return this.processCSVBody(lines);
    }
    filterHeader() {
        this.runtime.selectedColumns = [];
        if (this.runtime.headers) {
            const headers = this.runtime.headers;
            for (let i = 0; i < headers.length; i++) {
                if (this.params.ignoreColumns) {
                    if (this.params.ignoreColumns.test(headers[i])) {
                        if (this.params.includeColumns && this.params.includeColumns.test(headers[i])) {
                            this.runtime.selectedColumns.push(i);
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        this.runtime.selectedColumns.push(i);
                    }
                }
                else if (this.params.includeColumns) {
                    if (this.params.includeColumns.test(headers[i])) {
                        this.runtime.selectedColumns.push(i);
                    }
                }
                else {
                    this.runtime.selectedColumns.push(i);
                }
                // if (this.params.includeColumns && this.params.includeColumns.test(headers[i])){
                //   this.runtime.selectedColumns.push(i);
                // }else{
                //   if (this.params.ignoreColumns && this.params.ignoreColumns.test(headers[i])){
                //     continue;
                //   }else{
                //     if (this.params.ignoreColumns && !this.params.includeColumns){
                //       this.runtime.selectedColumns.push(i);
                //     }
                //   }
                // }
            }
            this.runtime.headers = util_1.filterArray(this.runtime.headers, this.runtime.selectedColumns);
        }
    }
    processCSVBody(lines) {
        if (this.params.output === "line") {
            return lines;
        }
        else {
            const result = this.rowSplit.parseMultiLines(lines);
            this.prependLeftBuf(util_1.bufFromString(result.partial));
            if (this.params.output === "csv") {
                return result.rowsCells;
            }
            else {
                return lineToJson_1.default(result.rowsCells, this.converter);
            }
        }
        // var jsonArr = linesToJson(lines.lines, params, this.recordNum);
        // this.processResult(jsonArr);
        // this.lastIndex += jsonArr.length;
        // this.recordNum += jsonArr.length;
    }
    prependLeftBuf(buf) {
        if (buf) {
            if (this.runtime.csvLineBuffer) {
                this.runtime.csvLineBuffer = Buffer.concat([buf, this.runtime.csvLineBuffer]);
            }
            else {
                this.runtime.csvLineBuffer = buf;
            }
        }
    }
    runPreLineHook(lines) {
        return new bluebird_1.default((resolve, reject) => {
            processLineHook(lines, this.runtime, 0, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(lines);
                }
            });
        });
    }
}
exports.ProcessorLocal = ProcessorLocal;
function processLineHook(lines, runtime, offset, cb) {
    if (offset >= lines.length) {
        cb();
    }
    else {
        if (runtime.preFileLineHook) {
            const line = lines[offset];
            const res = runtime.preFileLineHook(line, runtime.parsedLineNumber + offset);
            offset++;
            if (res && res.then) {
                res.then((value) => {
                    lines[offset - 1] = value;
                    processLineHook(lines, runtime, offset, cb);
                });
            }
            else {
                lines[offset - 1] = res;
                while (offset < lines.length) {
                    lines[offset] = runtime.preFileLineHook(lines[offset], runtime.parsedLineNumber + offset);
                    offset++;
                }
                cb();
            }
        }
        else {
            cb();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc29yTG9jYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9jZXNzb3JMb2NhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMkQ7QUFDM0QsdUNBQXlCO0FBQ3pCLDJDQUEwQztBQUMxQyxxQ0FBOEI7QUFDOUIseUNBQTJDO0FBQzNDLGlDQUE2RDtBQUM3RCx5Q0FBc0M7QUFDdEMsNkNBQXNDO0FBRXRDLHlDQUFrQztBQUlsQyxNQUFhLGNBQWUsU0FBUSxxQkFBUztJQUE3Qzs7UUFvQlUsYUFBUSxHQUFhLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEQsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixpQkFBWSxHQUFhLFNBQVMsQ0FBQztRQU9uQyxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNwQixrQkFBYSxHQUFhLFNBQVMsQ0FBQztJQXFNOUMsQ0FBQztJQWxPQyxLQUFLO1FBQ0gsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztpQkFDM0IsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1osSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN2RSxPQUFPLGtCQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVB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LElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUMxQixFQUFFLEVBQUUsQ0FBQztLQUNOO1NBQU07UUFDTCxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUM3RSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksR0FBRyxJQUFLLEdBQTJCLENBQUMsSUFBSSxFQUFFO2dCQUMzQyxHQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUMxQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztvQkFDMUIsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBYSxDQUFDO2dCQUNsQyxPQUFPLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO29CQUM1QixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBVyxDQUFDO29CQUNwRyxNQUFNLEVBQUUsQ0FBQztpQkFDVjtnQkFDRCxFQUFFLEVBQUUsQ0FBQzthQUNOO1NBQ0Y7YUFBTTtZQUNMLEVBQUUsRUFBRSxDQUFDO1NBQ047S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9jZXNzb3IsIFByb2Nlc3NMaW5lUmVzdWx0IH0gZnJvbSBcIi4vUHJvY2Vzc29yXCI7XG5pbXBvcnQgUCBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7IHByZXBhcmVEYXRhIH0gZnJvbSBcIi4vZGF0YUNsZWFuXCI7XG5pbXBvcnQgZ2V0RW9sIGZyb20gXCIuL2dldEVvbFwiO1xuaW1wb3J0IHsgc3RyaW5nVG9MaW5lcyB9IGZyb20gXCIuL2ZpbGVsaW5lXCI7XG5pbXBvcnQgeyBidWZGcm9tU3RyaW5nLCBmaWx0ZXJBcnJheSx0cmltTGVmdCB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCB7IFJvd1NwbGl0IH0gZnJvbSBcIi4vcm93U3BsaXRcIjtcbmltcG9ydCBsaW5lVG9Kc29uIGZyb20gXCIuL2xpbmVUb0pzb25cIjtcbmltcG9ydCB7IFBhcnNlUnVudGltZSB9IGZyb20gXCIuL1BhcnNlUnVudGltZVwiO1xuaW1wb3J0IENTVkVycm9yIGZyb20gXCIuL0NTVkVycm9yXCI7XG5cblxuXG5leHBvcnQgY2xhc3MgUHJvY2Vzc29yTG9jYWwgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICBmbHVzaCgpOiBQPFByb2Nlc3NMaW5lUmVzdWx0W10+IHtcbiAgICBpZiAodGhpcy5ydW50aW1lLmNzdkxpbmVCdWZmZXIgJiYgdGhpcy5ydW50aW1lLmNzdkxpbmVCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgYnVmID0gdGhpcy5ydW50aW1lLmNzdkxpbmVCdWZmZXI7XG4gICAgICB0aGlzLnJ1bnRpbWUuY3N2TGluZUJ1ZmZlciA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aGlzLnByb2Nlc3MoYnVmLCB0cnVlKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMucnVudGltZS5jc3ZMaW5lQnVmZmVyICYmIHRoaXMucnVudGltZS5jc3ZMaW5lQnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBQLnJlamVjdChDU1ZFcnJvci51bmNsb3NlZF9xdW90ZSh0aGlzLnJ1bnRpbWUucGFyc2VkTGluZU51bWJlciwgdGhpcy5ydW50aW1lLmNzdkxpbmVCdWZmZXIudG9TdHJpbmcoKSkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQLnJlc29sdmUocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQLnJlc29sdmUoW10pO1xuICAgIH1cbiAgfVxuICBkZXN0cm95KCk6IFA8dm9pZD4ge1xuICAgIHJldHVybiBQLnJlc29sdmUoKTtcbiAgfVxuICBwcml2YXRlIHJvd1NwbGl0OiBSb3dTcGxpdCA9IG5ldyBSb3dTcGxpdCh0aGlzLmNvbnZlcnRlcik7XG4gIHByaXZhdGUgZW9sRW1pdHRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9uZWVkRW1pdEVvbD86IGJvb2xlYW4gPSB1bmRlZmluZWQ7XG4gIHByaXZhdGUgZ2V0IG5lZWRFbWl0RW9sKCkge1xuICAgIGlmICh0aGlzLl9uZWVkRW1pdEVvbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9uZWVkRW1pdEVvbCA9IHRoaXMuY29udmVydGVyLmxpc3RlbmVycyhcImVvbFwiKS5sZW5ndGggPiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmVlZEVtaXRFb2w7XG4gIH1cbiAgcHJpdmF0ZSBoZWFkRW1pdHRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9uZWVkRW1pdEhlYWQ/OiBib29sZWFuID0gdW5kZWZpbmVkO1xuICBwcml2YXRlIGdldCBuZWVkRW1pdEhlYWQoKSB7XG4gICAgaWYgKHRoaXMuX25lZWRFbWl0SGVhZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9uZWVkRW1pdEhlYWQgPSB0aGlzLmNvbnZlcnRlci5saXN0ZW5lcnMoXCJoZWFkZXJcIikubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25lZWRFbWl0SGVhZDtcblxuICB9XG4gIHByb2Nlc3MoY2h1bms6IEJ1ZmZlciwgZmluYWxDaHVuayA9IGZhbHNlKTogUDxQcm9jZXNzTGluZVJlc3VsdFtdPiB7XG4gICAgbGV0IGNzdlN0cmluZzogc3RyaW5nO1xuICAgIGlmIChmaW5hbENodW5rKSB7XG4gICAgICBjc3ZTdHJpbmcgPSBjaHVuay50b1N0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjc3ZTdHJpbmcgPSBwcmVwYXJlRGF0YShjaHVuaywgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lKTtcblxuICAgIH1cbiAgICByZXR1cm4gUC5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucnVudGltZS5wcmVSYXdEYXRhSG9vaykge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJ1bnRpbWUucHJlUmF3RGF0YUhvb2soY3N2U3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY3N2U3RyaW5nO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oKGNzdikgPT4ge1xuICAgICAgICBpZiAoY3N2ICYmIGNzdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NTVihjc3YsIGZpbmFsQ2h1bmspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQLnJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgICB9KVxuICB9XG4gIHByaXZhdGUgcHJvY2Vzc0NTVihjc3Y6IHN0cmluZywgZmluYWxDaHVuazogYm9vbGVhbik6IFA8UHJvY2Vzc0xpbmVSZXN1bHRbXT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IHJ1bnRpbWUgPSB0aGlzLnJ1bnRpbWU7XG4gICAgaWYgKCFydW50aW1lLmVvbCkge1xuICAgICAgZ2V0RW9sKGNzdiwgcnVudGltZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5lZWRFbWl0RW9sICYmICF0aGlzLmVvbEVtaXR0ZWQgJiYgcnVudGltZS5lb2wpIHtcbiAgICAgIHRoaXMuY29udmVydGVyLmVtaXQoXCJlb2xcIiwgcnVudGltZS5lb2wpO1xuICAgICAgdGhpcy5lb2xFbWl0dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gdHJpbSBjc3YgZmlsZSBoYXMgaW5pdGlhbCBibGFuayBsaW5lcy5cbiAgICBpZiAocGFyYW1zLmlnbm9yZUVtcHR5ICYmICFydW50aW1lLnN0YXJ0ZWQpIHtcbiAgICAgIGNzdiA9IHRyaW1MZWZ0KGNzdik7XG4gICAgfVxuICAgIGNvbnN0IHN0cmluZ1RvTGluZVJlc3VsdCA9IHN0cmluZ1RvTGluZXMoY3N2LCBydW50aW1lKTtcbiAgICBpZiAoIWZpbmFsQ2h1bmspIHtcbiAgICAgIHRoaXMucHJlcGVuZExlZnRCdWYoYnVmRnJvbVN0cmluZyhzdHJpbmdUb0xpbmVSZXN1bHQucGFydGlhbCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJpbmdUb0xpbmVSZXN1bHQubGluZXMucHVzaChzdHJpbmdUb0xpbmVSZXN1bHQucGFydGlhbCk7XG4gICAgICBzdHJpbmdUb0xpbmVSZXN1bHQucGFydGlhbCA9IFwiXCI7XG4gICAgfVxuICAgIGlmIChzdHJpbmdUb0xpbmVSZXN1bHQubGluZXMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHByb206IFA8c3RyaW5nW10+O1xuICAgICAgaWYgKHJ1bnRpbWUucHJlRmlsZUxpbmVIb29rKSB7XG4gICAgICAgIHByb20gPSB0aGlzLnJ1blByZUxpbmVIb29rKHN0cmluZ1RvTGluZVJlc3VsdC5saW5lcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9tID0gUC5yZXNvbHZlKHN0cmluZ1RvTGluZVJlc3VsdC5saW5lcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbS50aGVuKChsaW5lcykgPT4ge1xuICAgICAgICBpZiAoIXJ1bnRpbWUuc3RhcnRlZFxuICAgICAgICAgICYmICF0aGlzLnJ1bnRpbWUuaGVhZGVyc1xuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzRGF0YVdpdGhIZWFkKGxpbmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzQ1NWQm9keShsaW5lcyk7XG4gICAgICAgIH1cblxuICAgICAgfSlcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJldHVybiBQLnJlc29sdmUoW10pO1xuICAgIH1cblxuICB9XG4gIHByaXZhdGUgcHJvY2Vzc0RhdGFXaXRoSGVhZChsaW5lczogc3RyaW5nW10pOiBQcm9jZXNzTGluZVJlc3VsdFtdIHtcbiAgICBpZiAodGhpcy5wYXJhbXMubm9oZWFkZXIpIHtcbiAgICAgIGlmICh0aGlzLnBhcmFtcy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMucnVudGltZS5oZWFkZXJzID0gdGhpcy5wYXJhbXMuaGVhZGVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucnVudGltZS5oZWFkZXJzID0gW107XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBsZWZ0ID0gXCJcIjtcbiAgICAgIGxldCBoZWFkZXJSb3c6IHN0cmluZ1tdID0gW107XG4gICAgICB3aGlsZSAobGluZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsZWZ0ICsgbGluZXMuc2hpZnQoKTtcbiAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5yb3dTcGxpdC5wYXJzZShsaW5lKTtcbiAgICAgICAgaWYgKHJvdy5jbG9zZWQpIHtcbiAgICAgICAgICBoZWFkZXJSb3cgPSByb3cuY2VsbHM7XG4gICAgICAgICAgbGVmdCA9IFwiXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVmdCA9IGxpbmUgKyBnZXRFb2wobGluZSwgdGhpcy5ydW50aW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5wcmVwZW5kTGVmdEJ1ZihidWZGcm9tU3RyaW5nKGxlZnQpKTtcblxuICAgICAgaWYgKGhlYWRlclJvdy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGFyYW1zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5ydW50aW1lLmhlYWRlcnMgPSB0aGlzLnBhcmFtcy5oZWFkZXJzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ydW50aW1lLmhlYWRlcnMgPSBoZWFkZXJSb3c7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnJ1bnRpbWUubmVlZFByb2Nlc3NJZ25vcmVDb2x1bW4gfHwgdGhpcy5ydW50aW1lLm5lZWRQcm9jZXNzSW5jbHVkZUNvbHVtbikge1xuICAgICAgdGhpcy5maWx0ZXJIZWFkZXIoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmVlZEVtaXRIZWFkICYmICF0aGlzLmhlYWRFbWl0dGVkKSB7XG4gICAgICB0aGlzLmNvbnZlcnRlci5lbWl0KFwiaGVhZGVyXCIsIHRoaXMucnVudGltZS5oZWFkZXJzKTtcbiAgICAgIHRoaXMuaGVhZEVtaXR0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzQ1NWQm9keShsaW5lcyk7XG4gIH1cbiAgcHJpdmF0ZSBmaWx0ZXJIZWFkZXIoKSB7XG4gICAgdGhpcy5ydW50aW1lLnNlbGVjdGVkQ29sdW1ucyA9IFtdO1xuICAgIGlmICh0aGlzLnJ1bnRpbWUuaGVhZGVycykge1xuICAgICAgY29uc3QgaGVhZGVycyA9IHRoaXMucnVudGltZS5oZWFkZXJzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWFkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5pZ25vcmVDb2x1bW5zKSB7XG4gICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmlnbm9yZUNvbHVtbnMudGVzdChoZWFkZXJzW2ldKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmluY2x1ZGVDb2x1bW5zICYmIHRoaXMucGFyYW1zLmluY2x1ZGVDb2x1bW5zLnRlc3QoaGVhZGVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5ydW50aW1lLnNlbGVjdGVkQ29sdW1ucy5wdXNoKGkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucnVudGltZS5zZWxlY3RlZENvbHVtbnMucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXJhbXMuaW5jbHVkZUNvbHVtbnMpIHtcbiAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuaW5jbHVkZUNvbHVtbnMudGVzdChoZWFkZXJzW2ldKSkge1xuICAgICAgICAgICAgdGhpcy5ydW50aW1lLnNlbGVjdGVkQ29sdW1ucy5wdXNoKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJ1bnRpbWUuc2VsZWN0ZWRDb2x1bW5zLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgKHRoaXMucGFyYW1zLmluY2x1ZGVDb2x1bW5zICYmIHRoaXMucGFyYW1zLmluY2x1ZGVDb2x1bW5zLnRlc3QoaGVhZGVyc1tpXSkpe1xuICAgICAgICAvLyAgIHRoaXMucnVudGltZS5zZWxlY3RlZENvbHVtbnMucHVzaChpKTtcbiAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgIC8vICAgaWYgKHRoaXMucGFyYW1zLmlnbm9yZUNvbHVtbnMgJiYgdGhpcy5wYXJhbXMuaWdub3JlQ29sdW1ucy50ZXN0KGhlYWRlcnNbaV0pKXtcbiAgICAgICAgLy8gICAgIGNvbnRpbnVlO1xuICAgICAgICAvLyAgIH1lbHNle1xuICAgICAgICAvLyAgICAgaWYgKHRoaXMucGFyYW1zLmlnbm9yZUNvbHVtbnMgJiYgIXRoaXMucGFyYW1zLmluY2x1ZGVDb2x1bW5zKXtcbiAgICAgICAgLy8gICAgICAgdGhpcy5ydW50aW1lLnNlbGVjdGVkQ29sdW1ucy5wdXNoKGkpO1xuICAgICAgICAvLyAgICAgfVxuXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgICB0aGlzLnJ1bnRpbWUuaGVhZGVycyA9IGZpbHRlckFycmF5KHRoaXMucnVudGltZS5oZWFkZXJzLCB0aGlzLnJ1bnRpbWUuc2VsZWN0ZWRDb2x1bW5zKTtcbiAgICB9XG5cbiAgfVxuICBwcml2YXRlIHByb2Nlc3NDU1ZCb2R5KGxpbmVzOiBzdHJpbmdbXSk6IFByb2Nlc3NMaW5lUmVzdWx0W10ge1xuICAgIGlmICh0aGlzLnBhcmFtcy5vdXRwdXQgPT09IFwibGluZVwiKSB7XG4gICAgICByZXR1cm4gbGluZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucm93U3BsaXQucGFyc2VNdWx0aUxpbmVzKGxpbmVzKTtcbiAgICAgIHRoaXMucHJlcGVuZExlZnRCdWYoYnVmRnJvbVN0cmluZyhyZXN1bHQucGFydGlhbCkpO1xuICAgICAgaWYgKHRoaXMucGFyYW1zLm91dHB1dCA9PT0gXCJjc3ZcIikge1xuICAgICAgICByZXR1cm4gcmVzdWx0LnJvd3NDZWxscztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsaW5lVG9Kc29uKHJlc3VsdC5yb3dzQ2VsbHMsIHRoaXMuY29udmVydGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YXIganNvbkFyciA9IGxpbmVzVG9Kc29uKGxpbmVzLmxpbmVzLCBwYXJhbXMsIHRoaXMucmVjb3JkTnVtKTtcbiAgICAvLyB0aGlzLnByb2Nlc3NSZXN1bHQoanNvbkFycik7XG4gICAgLy8gdGhpcy5sYXN0SW5kZXggKz0ganNvbkFyci5sZW5ndGg7XG4gICAgLy8gdGhpcy5yZWNvcmROdW0gKz0ganNvbkFyci5sZW5ndGg7XG4gIH1cblxuICBwcml2YXRlIHByZXBlbmRMZWZ0QnVmKGJ1ZjogQnVmZmVyKSB7XG4gICAgaWYgKGJ1Zikge1xuICAgICAgaWYgKHRoaXMucnVudGltZS5jc3ZMaW5lQnVmZmVyKSB7XG4gICAgICAgIHRoaXMucnVudGltZS5jc3ZMaW5lQnVmZmVyID0gQnVmZmVyLmNvbmNhdChbYnVmLCB0aGlzLnJ1bnRpbWUuY3N2TGluZUJ1ZmZlcl0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ydW50aW1lLmNzdkxpbmVCdWZmZXIgPSBidWY7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbiAgcHJpdmF0ZSBydW5QcmVMaW5lSG9vayhsaW5lczogc3RyaW5nW10pOiBQPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIG5ldyBQKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHByb2Nlc3NMaW5lSG9vayhsaW5lcywgdGhpcy5ydW50aW1lLCAwLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGxpbmVzKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGluZUhvb2sobGluZXM6IHN0cmluZ1tdLCBydW50aW1lOiBQYXJzZVJ1bnRpbWUsIG9mZnNldDogbnVtYmVyLFxuICBjYjogKGVycj8pID0+IHZvaWRcbikge1xuICBpZiAob2Zmc2V0ID49IGxpbmVzLmxlbmd0aCkge1xuICAgIGNiKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHJ1bnRpbWUucHJlRmlsZUxpbmVIb29rKSB7XG4gICAgICBjb25zdCBsaW5lID0gbGluZXNbb2Zmc2V0XTtcbiAgICAgIGNvbnN0IHJlcyA9IHJ1bnRpbWUucHJlRmlsZUxpbmVIb29rKGxpbmUsIHJ1bnRpbWUucGFyc2VkTGluZU51bWJlciArIG9mZnNldCk7XG4gICAgICBvZmZzZXQrKztcbiAgICAgIGlmIChyZXMgJiYgKHJlcyBhcyBQcm9taXNlTGlrZTxzdHJpbmc+KS50aGVuKSB7XG4gICAgICAgIChyZXMgYXMgUHJvbWlzZUxpa2U8c3RyaW5nPikudGhlbigodmFsdWUpID0+IHtcbiAgICAgICAgICBsaW5lc1tvZmZzZXQgLSAxXSA9IHZhbHVlO1xuICAgICAgICAgIHByb2Nlc3NMaW5lSG9vayhsaW5lcywgcnVudGltZSwgb2Zmc2V0LCBjYik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGluZXNbb2Zmc2V0IC0gMV0gPSByZXMgYXMgc3RyaW5nO1xuICAgICAgICB3aGlsZSAob2Zmc2V0IDwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgbGluZXNbb2Zmc2V0XSA9IHJ1bnRpbWUucHJlRmlsZUxpbmVIb29rKGxpbmVzW29mZnNldF0sIHJ1bnRpbWUucGFyc2VkTGluZU51bWJlciArIG9mZnNldCkgYXMgc3RyaW5nO1xuICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICB9XG4gICAgICAgIGNiKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKCk7XG4gICAgfVxuICB9XG59Il19