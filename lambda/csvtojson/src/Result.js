"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const bluebird_1 = require("bluebird");
const os_1 = require("os");
class Result {
    constructor(converter) {
        this.converter = converter;
        this.finalResult = [];
    }
    get needEmitLine() {
        return !!this.converter.parseRuntime.subscribe && !!this.converter.parseRuntime.subscribe.onNext || this.needPushDownstream;
    }
    get needPushDownstream() {
        if (this._needPushDownstream === undefined) {
            this._needPushDownstream = this.converter.listeners("data").length > 0 || this.converter.listeners("readable").length > 0;
        }
        return this._needPushDownstream;
    }
    get needEmitAll() {
        return !!this.converter.parseRuntime.then && this.converter.parseParam.needEmitAll;
        // return !!this.converter.parseRuntime.then;
    }
    processResult(resultLines) {
        const startPos = this.converter.parseRuntime.parsedLineNumber;
        if (this.needPushDownstream && this.converter.parseParam.downstreamFormat === "array") {
            if (startPos === 0) {
                pushDownstream(this.converter, "[" + os_1.EOL);
            }
        }
        // let prom: P<any>;
        return new bluebird_1.default((resolve, reject) => {
            if (this.needEmitLine) {
                processLineByLine(resultLines, this.converter, 0, this.needPushDownstream, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        this.appendFinalResult(resultLines);
                        resolve();
                    }
                });
                // resolve();
            }
            else {
                this.appendFinalResult(resultLines);
                resolve();
            }
        });
    }
    appendFinalResult(lines) {
        if (this.needEmitAll) {
            this.finalResult = this.finalResult.concat(lines);
        }
        this.converter.parseRuntime.parsedLineNumber += lines.length;
    }
    processError(err) {
        if (this.converter.parseRuntime.subscribe && this.converter.parseRuntime.subscribe.onError) {
            this.converter.parseRuntime.subscribe.onError(err);
        }
        if (this.converter.parseRuntime.then && this.converter.parseRuntime.then.onrejected) {
            this.converter.parseRuntime.then.onrejected(err);
        }
    }
    endProcess() {
        if (this.converter.parseRuntime.then && this.converter.parseRuntime.then.onfulfilled) {
            if (this.needEmitAll) {
                this.converter.parseRuntime.then.onfulfilled(this.finalResult);
            }
            else {
                this.converter.parseRuntime.then.onfulfilled([]);
            }
        }
        if (this.converter.parseRuntime.subscribe && this.converter.parseRuntime.subscribe.onCompleted) {
            this.converter.parseRuntime.subscribe.onCompleted();
        }
        if (this.needPushDownstream && this.converter.parseParam.downstreamFormat === "array") {
            pushDownstream(this.converter, "]" + os_1.EOL);
        }
    }
}
exports.Result = Result;
function processLineByLine(lines, conv, offset, needPushDownstream, cb) {
    if (offset >= lines.length) {
        cb();
    }
    else {
        if (conv.parseRuntime.subscribe && conv.parseRuntime.subscribe.onNext) {
            const hook = conv.parseRuntime.subscribe.onNext;
            const nextLine = lines[offset];
            const res = hook(nextLine, conv.parseRuntime.parsedLineNumber + offset);
            offset++;
            // if (isAsync === undefined) {
            if (res && res.then) {
                res.then(function () {
                    processRecursive(lines, hook, conv, offset, needPushDownstream, cb, nextLine);
                }, cb);
            }
            else {
                // processRecursive(lines, hook, conv, offset, needPushDownstream, cb, nextLine, false);
                if (needPushDownstream) {
                    pushDownstream(conv, nextLine);
                }
                while (offset < lines.length) {
                    const line = lines[offset];
                    hook(line, conv.parseRuntime.parsedLineNumber + offset);
                    offset++;
                    if (needPushDownstream) {
                        pushDownstream(conv, line);
                    }
                }
                cb();
            }
            // } else if (isAsync === true) {
            //   (res as PromiseLike<void>).then(function () {
            //     processRecursive(lines, hook, conv, offset, needPushDownstream, cb, nextLine, true);
            //   }, cb);
            // } else if (isAsync === false) {
            //   processRecursive(lines, hook, conv, offset, needPushDownstream, cb, nextLine, false);
            // }
        }
        else {
            if (needPushDownstream) {
                while (offset < lines.length) {
                    const line = lines[offset++];
                    pushDownstream(conv, line);
                }
            }
            cb();
        }
    }
}
function processRecursive(lines, hook, conv, offset, needPushDownstream, cb, res) {
    if (needPushDownstream) {
        pushDownstream(conv, res);
    }
    processLineByLine(lines, conv, offset, needPushDownstream, cb);
}
function pushDownstream(conv, res) {
    if (typeof res === "object" && !conv.options.objectMode) {
        const data = JSON.stringify(res);
        conv.push(data + (conv.parseParam.downstreamFormat === "array" ? "," + os_1.EOL : os_1.EOL), "utf8");
    }
    else {
        conv.push(res);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUmVzdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHVDQUF5QjtBQUV6QiwyQkFBeUI7QUFDekIsTUFBYSxNQUFNO0lBZ0JqQixZQUFvQixTQUFvQjtRQUFwQixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBRGhDLGdCQUFXLEdBQVUsRUFBRSxDQUFDO0lBQ1ksQ0FBQztJQWY3QyxJQUFZLFlBQVk7UUFDdEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQTtJQUM3SCxDQUFDO0lBRUQsSUFBWSxrQkFBa0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO1lBQzFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDM0g7UUFDRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztJQUNsQyxDQUFDO0lBQ0QsSUFBWSxXQUFXO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDbkYsNkNBQTZDO0lBQy9DLENBQUM7SUFHRCxhQUFhLENBQUMsV0FBZ0M7UUFDNUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUM7UUFDOUQsSUFBSSxJQUFJLENB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LEVBQUU7UUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsUUFBRyxDQUFDLENBQUMsQ0FBQyxRQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM1RjtTQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoQjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IFByb2Nlc3NMaW5lUmVzdWx0IH0gZnJvbSBcIi4vUHJvY2Vzc29yXCI7XG5pbXBvcnQgUCBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCBDU1ZFcnJvciBmcm9tIFwiLi9DU1ZFcnJvclwiO1xuaW1wb3J0IHsgRU9MIH0gZnJvbSBcIm9zXCI7XG5leHBvcnQgY2xhc3MgUmVzdWx0IHtcbiAgcHJpdmF0ZSBnZXQgbmVlZEVtaXRMaW5lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuY29udmVydGVyLnBhcnNlUnVudGltZS5zdWJzY3JpYmUgJiYgISF0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUuc3Vic2NyaWJlLm9uTmV4dCB8fCB0aGlzLm5lZWRQdXNoRG93bnN0cmVhbVxuICB9XG4gIHByaXZhdGUgX25lZWRQdXNoRG93bnN0cmVhbT86IGJvb2xlYW47XG4gIHByaXZhdGUgZ2V0IG5lZWRQdXNoRG93bnN0cmVhbSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fbmVlZFB1c2hEb3duc3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX25lZWRQdXNoRG93bnN0cmVhbSA9IHRoaXMuY29udmVydGVyLmxpc3RlbmVycyhcImRhdGFcIikubGVuZ3RoID4gMCB8fCB0aGlzLmNvbnZlcnRlci5saXN0ZW5lcnMoXCJyZWFkYWJsZVwiKS5sZW5ndGggPiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmVlZFB1c2hEb3duc3RyZWFtO1xuICB9XG4gIHByaXZhdGUgZ2V0IG5lZWRFbWl0QWxsKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuY29udmVydGVyLnBhcnNlUnVudGltZS50aGVuICYmIHRoaXMuY29udmVydGVyLnBhcnNlUGFyYW0ubmVlZEVtaXRBbGw7XG4gICAgLy8gcmV0dXJuICEhdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnRoZW47XG4gIH1cbiAgcHJpdmF0ZSBmaW5hbFJlc3VsdDogYW55W10gPSBbXTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb252ZXJ0ZXI6IENvbnZlcnRlcikgeyB9XG4gIHByb2Nlc3NSZXN1bHQocmVzdWx0TGluZXM6IFByb2Nlc3NMaW5lUmVzdWx0W10pOiBQPGFueT4ge1xuICAgIGNvbnN0IHN0YXJ0UG9zID0gdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnBhcnNlZExpbmVOdW1iZXI7XG4gICAgaWYgKHRoaXMubmVlZFB1c2hEb3duc3RyZWFtICYmIHRoaXMuY29udmVydGVyLnBhcnNlUGFyYW0uZG93bnN0cmVhbUZvcm1hdCA9PT0gXCJhcnJheVwiKSB7XG4gICAgICBpZiAoc3RhcnRQb3MgPT09IDApIHtcbiAgICAgICAgcHVzaERvd25zdHJlYW0odGhpcy5jb252ZXJ0ZXIsIFwiW1wiICsgRU9MKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gbGV0IHByb206IFA8YW55PjtcbiAgICByZXR1cm4gbmV3IFAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHRoaXMubmVlZEVtaXRMaW5lKSB7XG4gICAgICAgIHByb2Nlc3NMaW5lQnlMaW5lKFxuICAgICAgICAgIHJlc3VsdExpbmVzLFxuICAgICAgICAgIHRoaXMuY29udmVydGVyLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5uZWVkUHVzaERvd25zdHJlYW0sXG4gICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuYXBwZW5kRmluYWxSZXN1bHQocmVzdWx0TGluZXMpO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgKVxuICAgICAgICAvLyByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZEZpbmFsUmVzdWx0KHJlc3VsdExpbmVzKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgYXBwZW5kRmluYWxSZXN1bHQobGluZXM6IGFueVtdKSB7XG4gICAgaWYgKHRoaXMubmVlZEVtaXRBbGwpIHtcbiAgICAgIHRoaXMuZmluYWxSZXN1bHQgPSB0aGlzLmZpbmFsUmVzdWx0LmNvbmNhdChsaW5lcyk7XG4gICAgfVxuICAgIHRoaXMuY29udmVydGVyLnBhcnNlUnVudGltZS5wYXJzZWRMaW5lTnVtYmVyICs9IGxpbmVzLmxlbmd0aDtcbiAgfVxuICBwcm9jZXNzRXJyb3IoZXJyOiBDU1ZFcnJvcikge1xuICAgIGlmICh0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUuc3Vic2NyaWJlICYmIHRoaXMuY29udmVydGVyLnBhcnNlUnVudGltZS5zdWJzY3JpYmUub25FcnJvcikge1xuICAgICAgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnN1YnNjcmliZS5vbkVycm9yKGVycik7XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUudGhlbiAmJiB0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUudGhlbi5vbnJlamVjdGVkKSB7XG4gICAgICB0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUudGhlbi5vbnJlamVjdGVkKGVycik7XG4gICAgfVxuICB9XG4gIGVuZFByb2Nlc3MoKSB7XG4gICAgXG4gICAgICBpZiAodGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnRoZW4gJiYgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnRoZW4ub25mdWxmaWxsZWQpIHtcbiAgICAgICAgaWYgKHRoaXMubmVlZEVtaXRBbGwpIHtcbiAgICAgICAgICB0aGlzLmNvbnZlcnRlci5wYXJzZVJ1bnRpbWUudGhlbi5vbmZ1bGZpbGxlZCh0aGlzLmZpbmFsUmVzdWx0KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnRoZW4ub25mdWxmaWxsZWQoW10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgaWYgKHRoaXMuY29udmVydGVyLnBhcnNlUnVudGltZS5zdWJzY3JpYmUgJiYgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnN1YnNjcmliZS5vbkNvbXBsZXRlZCkge1xuICAgICAgdGhpcy5jb252ZXJ0ZXIucGFyc2VSdW50aW1lLnN1YnNjcmliZS5vbkNvbXBsZXRlZCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZWVkUHVzaERvd25zdHJlYW0gJiYgdGhpcy5jb252ZXJ0ZXIucGFyc2VQYXJhbS5kb3duc3RyZWFtRm9ybWF0ID09PSBcImFycmF5XCIpIHtcbiAgICAgIHB1c2hEb3duc3RyZWFtKHRoaXMuY29udmVydGVyLCBcIl1cIiArIEVPTCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NMaW5lQnlMaW5lKFxuICBsaW5lczogUHJvY2Vzc0xpbmVSZXN1bHRbXSxcblxuICBjb252OiBDb252ZXJ0ZXIsXG4gIG9mZnNldDogbnVtYmVyLFxuICBuZWVkUHVzaERvd25zdHJlYW06IGJvb2xlYW4sXG4gIGNiOiAoZXJyPykgPT4gdm9pZCxcbikge1xuICBpZiAob2Zmc2V0ID49IGxpbmVzLmxlbmd0aCkge1xuICAgIGNiKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbnYucGFyc2VSdW50aW1lLnN1YnNjcmliZSAmJiBjb252LnBhcnNlUnVudGltZS5zdWJzY3JpYmUub25OZXh0KSB7XG4gICAgICBjb25zdCBob29rID0gY29udi5wYXJzZVJ1bnRpbWUuc3Vic2NyaWJlLm9uTmV4dDtcbiAgICAgIGNvbnN0IG5leHRMaW5lID0gbGluZXNbb2Zmc2V0XTtcbiAgICAgIGNvbnN0IHJlcyA9IGhvb2sobmV4dExpbmUsIGNvbnYucGFyc2VSdW50aW1lLnBhcnNlZExpbmVOdW1iZXIgKyBvZmZzZXQpO1xuICAgICAgb2Zmc2V0Kys7XG4gICAgICAvLyBpZiAoaXNBc3luYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocmVzICYmIHJlcy50aGVuKSB7XG4gICAgICAgIHJlcy50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBwcm9jZXNzUmVjdXJzaXZlKGxpbmVzLCBob29rLCBjb252LCBvZmZzZXQsIG5lZWRQdXNoRG93bnN0cmVhbSwgY2IsIG5leHRMaW5lKTtcbiAgICAgICAgfSwgY2IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcHJvY2Vzc1JlY3Vyc2l2ZShsaW5lcywgaG9vaywgY29udiwgb2Zmc2V0LCBuZWVkUHVzaERvd25zdHJlYW0sIGNiLCBuZXh0TGluZSwgZmFsc2UpO1xuICAgICAgICBpZiAobmVlZFB1c2hEb3duc3RyZWFtKSB7XG4gICAgICAgICAgcHVzaERvd25zdHJlYW0oY29udiwgbmV4dExpbmUpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBsaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbb2Zmc2V0XTtcbiAgICAgICAgICBob29rKGxpbmUsIGNvbnYucGFyc2VSdW50aW1lLnBhcnNlZExpbmVOdW1iZXIgKyBvZmZzZXQpO1xuICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICAgIGlmIChuZWVkUHVzaERvd25zdHJlYW0pIHtcbiAgICAgICAgICAgIHB1c2hEb3duc3RyZWFtKGNvbnYsIGxpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgICAgLy8gfSBlbHNlIGlmIChpc0FzeW5jID09PSB0cnVlKSB7XG4gICAgICAvLyAgIChyZXMgYXMgUHJvbWlzZUxpa2U8dm9pZD4pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgLy8gICAgIHByb2Nlc3NSZWN1cnNpdmUobGluZXMsIGhvb2ssIGNvbnYsIG9mZnNldCwgbmVlZFB1c2hEb3duc3RyZWFtLCBjYiwgbmV4dExpbmUsIHRydWUpO1xuICAgICAgLy8gICB9LCBjYik7XG4gICAgICAvLyB9IGVsc2UgaWYgKGlzQXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAvLyAgIHByb2Nlc3NSZWN1cnNpdmUobGluZXMsIGhvb2ssIGNvbnYsIG9mZnNldCwgbmVlZFB1c2hEb3duc3RyZWFtLCBjYiwgbmV4dExpbmUsIGZhbHNlKTtcbiAgICAgIC8vIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG5lZWRQdXNoRG93bnN0cmVhbSkge1xuICAgICAgICB3aGlsZSAob2Zmc2V0IDwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW29mZnNldCsrXTtcbiAgICAgICAgICBwdXNoRG93bnN0cmVhbShjb252LCBsaW5lKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICBjYigpO1xuICAgIH1cblxuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NSZWN1cnNpdmUoXG4gIGxpbmVzOiBQcm9jZXNzTGluZVJlc3VsdFtdLFxuICBob29rOiAoZGF0YTogYW55LCBsaW5lTnVtYmVyOiBudW1iZXIpID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPixcbiAgY29udjogQ29udmVydGVyLFxuICBvZmZzZXQ6IG51bWJlcixcbiAgbmVlZFB1c2hEb3duc3RyZWFtOiBib29sZWFuLFxuICBjYjogKGVycj8pID0+IHZvaWQsXG4gIHJlczogUHJvY2Vzc0xpbmVSZXN1bHQsXG4pIHtcbiAgaWYgKG5lZWRQdXNoRG93bnN0cmVhbSkge1xuICAgIHB1c2hEb3duc3RyZWFtKGNvbnYsIHJlcyk7XG4gIH1cbiAgcHJvY2Vzc0xpbmVCeUxpbmUobGluZXMsIGNvbnYsIG9mZnNldCwgbmVlZFB1c2hEb3duc3RyZWFtLCBjYik7XG59XG5mdW5jdGlvbiBwdXNoRG93bnN0cmVhbShjb252OiBDb252ZXJ0ZXIsIHJlczogUHJvY2Vzc0xpbmVSZXN1bHQpIHtcbiAgaWYgKHR5cGVvZiByZXMgPT09IFwib2JqZWN0XCIgJiYgIWNvbnYub3B0aW9ucy5vYmplY3RNb2RlKSB7XG4gICAgY29uc3QgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHJlcyk7XG4gICAgY29udi5wdXNoKGRhdGEgKyAoY29udi5wYXJzZVBhcmFtLmRvd25zdHJlYW1Gb3JtYXQgPT09IFwiYXJyYXlcIiA/IFwiLFwiICsgRU9MIDogRU9MKSwgXCJ1dGY4XCIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnYucHVzaChyZXMpO1xuICB9XG59Il19