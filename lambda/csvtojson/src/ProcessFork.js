"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EOM = exports.ProcessorFork = void 0;
const Processor_1 = require("./Processor");
const bluebird_1 = require("bluebird");
const Parameters_1 = require("./Parameters");
const CSVError_1 = require("./CSVError");
class ProcessorFork extends Processor_1.Processor {
    constructor(converter) {
        super(converter);
        this.converter = converter;
        this.inited = false;
        this.resultBuf = [];
        this.leftChunk = "";
        this.finalChunk = false;
        this.childProcess = require("child_process").spawn(process.execPath, [__dirname + "/../v2/worker.js"], {
            stdio: ["pipe", "pipe", "pipe", "ipc"]
        });
        this.initWorker();
    }
    flush() {
        return new bluebird_1.default((resolve, reject) => {
            // console.log("flush");
            this.finalChunk = true;
            this.next = resolve;
            this.childProcess.stdin.end();
            // this.childProcess.stdout.on("end",()=>{
            //   // console.log("!!!!");
            //   this.flushResult();
            // })
        });
    }
    destroy() {
        this.childProcess.kill();
        return bluebird_1.default.resolve();
    }
    prepareParam(param) {
        const clone = Parameters_1.mergeParams(param);
        if (clone.ignoreColumns) {
            clone.ignoreColumns = {
                source: clone.ignoreColumns.source,
                flags: clone.ignoreColumns.flags
            };
        }
        if (clone.includeColumns) {
            clone.includeColumns = {
                source: clone.includeColumns.source,
                flags: clone.includeColumns.flags
            };
        }
        return clone;
    }
    initWorker() {
        this.childProcess.on("exit", () => {
            this.flushResult();
        });
        this.childProcess.send({
            cmd: "init",
            params: this.prepareParam(this.converter.parseParam)
        });
        this.childProcess.on("message", (msg) => {
            if (msg.cmd === "inited") {
                this.inited = true;
            }
            else if (msg.cmd === "eol") {
                if (this.converter.listeners("eol").length > 0) {
                    this.converter.emit("eol", msg.value);
                }
            }
            else if (msg.cmd === "header") {
                if (this.converter.listeners("header").length > 0) {
                    this.converter.emit("header", msg.value);
                }
            }
            else if (msg.cmd === "done") {
                // this.flushResult();
            }
        });
        this.childProcess.stdout.on("data", (data) => {
            // console.log("stdout", data.toString());
            const res = data.toString();
            // console.log(res);
            this.appendBuf(res);
        });
        this.childProcess.stderr.on("data", (data) => {
            // console.log("stderr", data.toString());
            this.converter.emit("error", CSVError_1.default.fromJSON(JSON.parse(data.toString())));
        });
    }
    flushResult() {
        // console.log("flush result", this.resultBuf.length);
        if (this.next) {
            this.next(this.resultBuf);
        }
        this.resultBuf = [];
    }
    appendBuf(data) {
        const res = this.leftChunk + data;
        const list = res.split("\n");
        let counter = 0;
        const lastBit = list[list.length - 1];
        if (lastBit !== "") {
            this.leftChunk = list.pop() || "";
        }
        else {
            this.leftChunk = "";
        }
        this.resultBuf = this.resultBuf.concat(list);
        // while (list.length) {
        //   let item = list.shift() || "";
        //   if (item.length === 0 ) {
        //     continue;
        //   }
        //   // if (this.params.output !== "line") {
        //   //     item = JSON.parse(item);
        //   // }
        //   this.resultBuf.push(item);
        //   counter++;
        // }
        // console.log("buf length",this.resultBuf.length);
    }
    process(chunk) {
        return new bluebird_1.default((resolve, reject) => {
            // console.log("chunk", chunk.length);
            this.next = resolve;
            // this.appendReadBuf(chunk);
            this.childProcess.stdin.write(chunk, () => {
                // console.log("chunk callback");
                this.flushResult();
            });
        });
    }
}
exports.ProcessorFork = ProcessorFork;
exports.EOM = "\x03";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc0ZvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9jZXNzRm9yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMkQ7QUFDM0QsdUNBQXdCO0FBR3hCLDZDQUEwRDtBQUkxRCx5Q0FBa0M7QUFFbEMsTUFBYSxhQUFjLFNBQVEscUJBQVM7SUF1QjFDLFlBQXNCLFNBQW9CO1FBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQURHLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFMMUMsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUNoQixjQUFTLEdBQXdCLEVBQUUsQ0FBQztRQUNwQyxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFJbEMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsRUFBRTtZQUNyRyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUE1QkQsS0FBSztRQUNILE9BQU8sSUFBSSxrQkFBQyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQy9CLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztZQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM5QiwwQ0FBMEM7WUFDMUMsNEJBQTRCO1lBQzVCLHdCQUF3QjtZQUN4QixLQUFLO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTztRQUNMLElBQUks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LE9BQU8sQ0FBQztZQUNwQiw2QkFBNkI7WUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7Z0JBQ3hDLGlDQUFpQztnQkFDakMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvSEQsc0NBK0hDO0FBWVksUUFBQSxHQUFHLEdBQUcsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvY2Vzc29yLCBQcm9jZXNzTGluZVJlc3VsdCB9IGZyb20gXCIuL1Byb2Nlc3NvclwiO1xuaW1wb3J0IFAgZnJvbSBcImJsdWViaXJkXCJcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgQ2hpbGRQcm9jZXNzIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IENTVlBhcnNlUGFyYW0sIG1lcmdlUGFyYW1zIH0gZnJvbSBcIi4vUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHsgUGFyc2VSdW50aW1lIH0gZnJvbSBcIi4vUGFyc2VSdW50aW1lXCI7XG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUgfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQgeyBidWZGcm9tU3RyaW5nLCBlbXB0eUJ1ZmZlciB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCBDU1ZFcnJvciBmcm9tIFwiLi9DU1ZFcnJvclwiO1xuXG5leHBvcnQgY2xhc3MgUHJvY2Vzc29yRm9yayBleHRlbmRzIFByb2Nlc3NvciB7XG4gIGZsdXNoKCk6IFA8UHJvY2Vzc0xpbmVSZXN1bHRbXT4ge1xuICAgIHJldHVybiBuZXcgUCgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImZsdXNoXCIpO1xuICAgICAgdGhpcy5maW5hbENodW5rID0gdHJ1ZTtcbiAgICAgIHRoaXMubmV4dCA9IHJlc29sdmU7XG4gICAgICB0aGlzLmNoaWxkUHJvY2Vzcy5zdGRpbi5lbmQoKTtcbiAgICAgIC8vIHRoaXMuY2hpbGRQcm9jZXNzLnN0ZG91dC5vbihcImVuZFwiLCgpPT57XG4gICAgICAvLyAgIC8vIGNvbnNvbGUubG9nKFwiISEhIVwiKTtcbiAgICAgIC8vICAgdGhpcy5mbHVzaFJlc3VsdCgpO1xuICAgICAgLy8gfSlcbiAgICB9KTtcbiAgfVxuICBkZXN0cm95KCk6IFA8dm9pZD4ge1xuICAgIHRoaXMuY2hpbGRQcm9jZXNzLmtpbGwoKTtcbiAgICByZXR1cm4gUC5yZXNvbHZlKCk7XG4gIH1cbiAgY2hpbGRQcm9jZXNzOiBDaGlsZFByb2Nlc3M7XG4gIGluaXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIHJlc3VsdEJ1ZjogUHJvY2Vzc0xpbmVSZXN1bHRbXSA9IFtdO1xuICBwcml2YXRlIGxlZnRDaHVuazogc3RyaW5nID0gXCJcIjtcbiAgcHJpdmF0ZSBmaW5hbENodW5rOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgbmV4dD86IChyZXN1bHQ6IFByb2Nlc3NMaW5lUmVzdWx0W10pID0+IGFueTtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGNvbnZlcnRlcjogQ29udmVydGVyKSB7XG4gICAgc3VwZXIoY29udmVydGVyKTtcbiAgICB0aGlzLmNoaWxkUHJvY2VzcyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpLnNwYXduKHByb2Nlc3MuZXhlY1BhdGgsIFtfX2Rpcm5hbWUgKyBcIi8uLi92Mi93b3JrZXIuanNcIl0sIHtcbiAgICAgIHN0ZGlvOiBbXCJwaXBlXCIsIFwicGlwZVwiLCBcInBpcGVcIiwgXCJpcGNcIl1cbiAgICB9KTtcbiAgICB0aGlzLmluaXRXb3JrZXIoKTtcbiAgfVxuICBwcml2YXRlIHByZXBhcmVQYXJhbShwYXJhbTpDU1ZQYXJzZVBhcmFtKTphbnl7XG4gICAgY29uc3QgY2xvbmU6YW55PW1lcmdlUGFyYW1zKHBhcmFtKTtcbiAgICBpZiAoY2xvbmUuaWdub3JlQ29sdW1ucyl7XG4gICAgICBjbG9uZS5pZ25vcmVDb2x1bW5zPXtcbiAgICAgICAgc291cmNlOmNsb25lLmlnbm9yZUNvbHVtbnMuc291cmNlLFxuICAgICAgICBmbGFnczpjbG9uZS5pZ25vcmVDb2x1bW5zLmZsYWdzXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjbG9uZS5pbmNsdWRlQ29sdW1ucyl7XG4gICAgICBjbG9uZS5pbmNsdWRlQ29sdW1ucz17XG4gICAgICAgIHNvdXJjZTpjbG9uZS5pbmNsdWRlQ29sdW1ucy5zb3VyY2UsXG4gICAgICAgIGZsYWdzOmNsb25lLmluY2x1ZGVDb2x1bW5zLmZsYWdzXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuICBwcml2YXRlIGluaXRXb3JrZXIoKSB7XG4gICAgdGhpcy5jaGlsZFByb2Nlc3Mub24oXCJleGl0XCIsKCk9PntcbiAgICAgIHRoaXMuZmx1c2hSZXN1bHQoKTtcbiAgICB9KVxuICAgIHRoaXMuY2hpbGRQcm9jZXNzLnNlbmQoe1xuICAgICAgY21kOiBcImluaXRcIixcbiAgICAgIHBhcmFtczogdGhpcy5wcmVwYXJlUGFyYW0odGhpcy5jb252ZXJ0ZXIucGFyc2VQYXJhbSlcbiAgICB9IGFzIEluaXRNZXNzYWdlKTtcbiAgICB0aGlzLmNoaWxkUHJvY2Vzcy5vbihcIm1lc3NhZ2VcIiwgKG1zZzogTWVzc2FnZSkgPT4ge1xuICAgICAgaWYgKG1zZy5jbWQgPT09IFwiaW5pdGVkXCIpIHtcbiAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChtc2cuY21kID09PSBcImVvbFwiKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnZlcnRlci5saXN0ZW5lcnMoXCJlb2xcIikubGVuZ3RoID4gMCl7XG4gICAgICAgICAgdGhpcy5jb252ZXJ0ZXIuZW1pdChcImVvbFwiLChtc2cgYXMgU3RyaW5nTWVzc2FnZSkudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZiAobXNnLmNtZCA9PT0gXCJoZWFkZXJcIikge1xuICAgICAgICBpZiAodGhpcy5jb252ZXJ0ZXIubGlzdGVuZXJzKFwiaGVhZGVyXCIpLmxlbmd0aCA+IDApe1xuICAgICAgICAgIHRoaXMuY29udmVydGVyLmVtaXQoXCJoZWFkZXJcIiwobXNnIGFzIFN0cmluZ01lc3NhZ2UpLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYgKG1zZy5jbWQgPT09IFwiZG9uZVwiKXtcblxuICAgICAgICAvLyB0aGlzLmZsdXNoUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICB9KTtcbiAgICB0aGlzLmNoaWxkUHJvY2Vzcy5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInN0ZG91dFwiLCBkYXRhLnRvU3RyaW5nKCkpO1xuICAgICAgY29uc3QgcmVzID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgLy8gY29uc29sZS5sb2cocmVzKTtcbiAgICAgIHRoaXMuYXBwZW5kQnVmKHJlcyk7XG5cbiAgICB9KTtcbiAgICB0aGlzLmNoaWxkUHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInN0ZGVyclwiLCBkYXRhLnRvU3RyaW5nKCkpO1xuICAgICAgdGhpcy5jb252ZXJ0ZXIuZW1pdChcImVycm9yXCIsIENTVkVycm9yLmZyb21KU09OKEpTT04ucGFyc2UoZGF0YS50b1N0cmluZygpKSkpO1xuICAgIH0pO1xuXG4gIH1cbiAgcHJpdmF0ZSBmbHVzaFJlc3VsdCgpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImZsdXNoIHJlc3VsdFwiLCB0aGlzLnJlc3VsdEJ1Zi5sZW5ndGgpO1xuICAgIGlmICh0aGlzLm5leHQpIHtcbiAgICAgIHRoaXMubmV4dCh0aGlzLnJlc3VsdEJ1Zik7XG4gICAgfVxuICAgIHRoaXMucmVzdWx0QnVmID0gW107XG4gIH1cbiAgcHJpdmF0ZSBhcHBlbmRCdWYoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzID0gdGhpcy5sZWZ0Q2h1bmsgKyBkYXRhO1xuICAgIGNvbnN0IGxpc3QgPSByZXMuc3BsaXQoXCJcXG5cIik7XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIGNvbnN0IGxhc3RCaXQgPSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XG4gICAgaWYgKGxhc3RCaXQgIT09IFwiXCIpIHtcbiAgICAgIHRoaXMubGVmdENodW5rID0gbGlzdC5wb3AoKSB8fCBcIlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxlZnRDaHVuayA9IFwiXCI7XG4gICAgfVxuICAgIHRoaXMucmVzdWx0QnVmPXRoaXMucmVzdWx0QnVmLmNvbmNhdChsaXN0KTtcbiAgICAvLyB3aGlsZSAobGlzdC5sZW5ndGgpIHtcbiAgICAvLyAgIGxldCBpdGVtID0gbGlzdC5zaGlmdCgpIHx8IFwiXCI7XG4gICAgLy8gICBpZiAoaXRlbS5sZW5ndGggPT09IDAgKSB7XG4gICAgLy8gICAgIGNvbnRpbnVlO1xuICAgIC8vICAgfVxuICAgIC8vICAgLy8gaWYgKHRoaXMucGFyYW1zLm91dHB1dCAhPT0gXCJsaW5lXCIpIHtcbiAgICAvLyAgIC8vICAgICBpdGVtID0gSlNPTi5wYXJzZShpdGVtKTtcbiAgICAvLyAgIC8vIH1cbiAgICAvLyAgIHRoaXMucmVzdWx0QnVmLnB1c2goaXRlbSk7XG4gICAgLy8gICBjb3VudGVyKys7XG4gICAgLy8gfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVmIGxlbmd0aFwiLHRoaXMucmVzdWx0QnVmLmxlbmd0aCk7XG4gIH1cblxuICBwcm9jZXNzKGNodW5rOiBCdWZmZXIpOiBQPFByb2Nlc3NMaW5lUmVzdWx0W10+IHtcbiAgICByZXR1cm4gbmV3IFAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJjaHVua1wiLCBjaHVuay5sZW5ndGgpO1xuICAgICAgdGhpcy5uZXh0ID0gcmVzb2x2ZTtcbiAgICAgIC8vIHRoaXMuYXBwZW5kUmVhZEJ1ZihjaHVuayk7XG4gICAgICB0aGlzLmNoaWxkUHJvY2Vzcy5zdGRpbi53cml0ZShjaHVuaywgKCkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNodW5rIGNhbGxiYWNrXCIpO1xuICAgICAgICB0aGlzLmZsdXNoUmVzdWx0KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2Uge1xuICBjbWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluaXRNZXNzYWdlIGV4dGVuZHMgTWVzc2FnZSB7XG4gIHBhcmFtczogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBTdHJpbmdNZXNzYWdlIGV4dGVuZHMgTWVzc2FnZSB7XG4gIHZhbHVlOiBzdHJpbmdcbn1cbmV4cG9ydCBjb25zdCBFT00gPSBcIlxceDAzXCI7Il19