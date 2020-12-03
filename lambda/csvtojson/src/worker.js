"use strict";
// import { Converter } from "./Converter";
// import { Message, InitMessage, EOM } from "./ProcessFork";
// import CSVError from "./CSVError";
// import { CSVParseParam } from "./Parameters";
// process.on("message", processMsg);
// let conv: Converter;
// function processMsg(msg: Message) {
//   if (msg.cmd === "init") {
//     const param = prepareParams((msg as InitMessage).params);
//     param.fork = false;
//     conv = new Converter(param);
//     process.stdin.pipe(conv).pipe(process.stdout);
//     conv.on("error", (err) => {
//       if ((err as CSVError).line) {
//         process.stderr.write(JSON.stringify({
//           err: (err as CSVError).err,
//           line: (err as CSVError).line,
//           extra: (err as CSVError).extra
//         }))
//       } else {
//         process.stderr.write(JSON.stringify({
//           err: err.message,
//           line: -1,
//           extra: "Unknown error"
//         }));
//       }
//     });
//     conv.on("eol", (eol) => {
//       // console.log("eol!!!",eol);
//       if (process.send)
//         process.send({ cmd: "eol", "value": eol });
//     })
//     conv.on("header", (header) => {
//       if (process.send)
//         process.send({ cmd: "header", "value": header });
//     })
//     conv.on("done", () => {
//       const drained = process.stdout.write("", () => {
//         if (drained) {
//           gracelyExit();
//         }
//       });
//       if (!drained) {
//         process.stdout.on("drain", gracelyExit)
//       }
//       // process.stdout.write(EOM);
//     })
//     if (process.send) {
//       process.send({ cmd: "inited" });
//     }
//   }
// }
// function gracelyExit(){
//   setTimeout(()=>{
//     conv.removeAllListeners();
//     process.removeAllListeners();
//   },50);
// }
// function prepareParams(p: any): CSVParseParam {
//   if (p.ignoreColumns) {
//     p.ignoreColumns = new RegExp(p.ignoreColumns.source, p.ignoreColumns.flags)
//   }
//   if (p.includeColumns) {
//     p.includeColumns = new RegExp(p.includeColumns.source, p.includeColumns.flags)
//   }
//   return p;
// }
// process.on("disconnect", () => {
//   process.exit(-1);
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQ0FBMkM7QUFDM0MsNkRBQTZEO0FBQzdELHFDQUFxQztBQUNyQyxnREFBZ0Q7QUFDaEQscUNBQXFDO0FBQ3JDLHVCQUF1QjtBQUN2QixzQ0FBc0M7QUFDdEMsOEJBQThCO0FBQzlCLGdFQUFnRTtBQUNoRSwwQkFBMEI7QUFDMUIsbUNBQW1DO0FBQ25DLHFEQUFxRDtBQUNyRCxrQ0FBa0M7QUFDbEMsc0NBQXNDO0FBQ3RDLGdEQUFnRDtBQUNoRCx3Q0FBd0M7QUFDeEMsMENBQTBDO0FBQzFDLDJDQUEyQztBQUMzQyxjQUFjO0FBQ2QsaUJBQWlCO0FBQ2pCLGdEQUFnRDtBQUNoRCw4QkFBOEI7QUFDOUIsc0JBQXNCO0FBQ3RCLG1DQUFtQztBQUNuQyxlQUFlO0FBQ2YsVUFBVTtBQUVWLFVBQVU7QUFDVixnQ0FBZ0M7QUFDaEMsc0NBQXNDO0FBQ3RDLDBCQUEwQjtBQUMxQixzREFBc0Q7QUFDdEQsU0FBUztBQUNULHNDQUFzQztBQUN0QywwQkFBMEI7QUFDMUIsNERBQTREO0FBQzVELFNBQVM7QUFDVCw4QkFBOEI7QUFDOUIseURBQXlEO0FBQ3pELHlCQUF5QjtBQUN6QiwyQkFBMkI7QUFDM0IsWUFBWTtBQUNaLFlBQVk7QUFDWix3QkFBd0I7QUFDeEIsa0RBQWtEO0FBQ2xELFVBQVU7QUFHVixzQ0FBc0M7QUFDdEMsU0FBUztBQUNULDBCQUEwQjtBQUMxQix5Q0FBeUM7QUFDekMsUUFBUTtBQUdSLE1BQU07QUFDTixJQUFJO0FBQ0osMEJBQTBCO0FBQzFCLHFCQUFxQjtBQUNyQixpQ0FBaUM7QUFDakMsb0NBQW9DO0FBQ3BDLFdBQVc7QUFDWCxJQUFJO0FBQ0osa0RBQWtEO0FBQ2xELDJCQUEyQjtBQUMzQixrRkFBa0Y7QUFDbEYsTUFBTTtBQUNOLDRCQUE0QjtBQUM1QixxRkFBcUY7QUFDckYsTUFBTTtBQUNOLGNBQWM7QUFDZCxJQUFJO0FBRUosbUNBQW1DO0FBQ25DLHNCQUFzQjtBQUN0QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4vQ29udmVydGVyXCI7XG4vLyBpbXBvcnQgeyBNZXNzYWdlLCBJbml0TWVzc2FnZSwgRU9NIH0gZnJvbSBcIi4vUHJvY2Vzc0ZvcmtcIjtcbi8vIGltcG9ydCBDU1ZFcnJvciBmcm9tIFwiLi9DU1ZFcnJvclwiO1xuLy8gaW1wb3J0IHsgQ1NWUGFyc2VQYXJhbSB9IGZyb20gXCIuL1BhcmFtZXRlcnNcIjtcbi8vIHByb2Nlc3Mub24oXCJtZXNzYWdlXCIsIHByb2Nlc3NNc2cpO1xuLy8gbGV0IGNvbnY6IENvbnZlcnRlcjtcbi8vIGZ1bmN0aW9uIHByb2Nlc3NNc2cobXNnOiBNZXNzYWdlKSB7XG4vLyAgIGlmIChtc2cuY21kID09PSBcImluaXRcIikge1xuLy8gICAgIGNvbnN0IHBhcmFtID0gcHJlcGFyZVBhcmFtcygobXNnIGFzIEluaXRNZXNzYWdlKS5wYXJhbXMpO1xuLy8gICAgIHBhcmFtLmZvcmsgPSBmYWxzZTtcbi8vICAgICBjb252ID0gbmV3IENvbnZlcnRlcihwYXJhbSk7XG4vLyAgICAgcHJvY2Vzcy5zdGRpbi5waXBlKGNvbnYpLnBpcGUocHJvY2Vzcy5zdGRvdXQpO1xuLy8gICAgIGNvbnYub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XG4vLyAgICAgICBpZiAoKGVyciBhcyBDU1ZFcnJvcikubGluZSkge1xuLy8gICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShKU09OLnN0cmluZ2lmeSh7XG4vLyAgICAgICAgICAgZXJyOiAoZXJyIGFzIENTVkVycm9yKS5lcnIsXG4vLyAgICAgICAgICAgbGluZTogKGVyciBhcyBDU1ZFcnJvcikubGluZSxcbi8vICAgICAgICAgICBleHRyYTogKGVyciBhcyBDU1ZFcnJvcikuZXh0cmFcbi8vICAgICAgICAgfSkpXG4vLyAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShKU09OLnN0cmluZ2lmeSh7XG4vLyAgICAgICAgICAgZXJyOiBlcnIubWVzc2FnZSxcbi8vICAgICAgICAgICBsaW5lOiAtMSxcbi8vICAgICAgICAgICBleHRyYTogXCJVbmtub3duIGVycm9yXCJcbi8vICAgICAgICAgfSkpO1xuLy8gICAgICAgfVxuXG4vLyAgICAgfSk7XG4vLyAgICAgY29udi5vbihcImVvbFwiLCAoZW9sKSA9PiB7XG4vLyAgICAgICAvLyBjb25zb2xlLmxvZyhcImVvbCEhIVwiLGVvbCk7XG4vLyAgICAgICBpZiAocHJvY2Vzcy5zZW5kKVxuLy8gICAgICAgICBwcm9jZXNzLnNlbmQoeyBjbWQ6IFwiZW9sXCIsIFwidmFsdWVcIjogZW9sIH0pO1xuLy8gICAgIH0pXG4vLyAgICAgY29udi5vbihcImhlYWRlclwiLCAoaGVhZGVyKSA9PiB7XG4vLyAgICAgICBpZiAocHJvY2Vzcy5zZW5kKVxuLy8gICAgICAgICBwcm9jZXNzLnNlbmQoeyBjbWQ6IFwiaGVhZGVyXCIsIFwidmFsdWVcIjogaGVhZGVyIH0pO1xuLy8gICAgIH0pXG4vLyAgICAgY29udi5vbihcImRvbmVcIiwgKCkgPT4ge1xuLy8gICAgICAgY29uc3QgZHJhaW5lZCA9IHByb2Nlc3Muc3Rkb3V0LndyaXRlKFwiXCIsICgpID0+IHtcbi8vICAgICAgICAgaWYgKGRyYWluZWQpIHtcbi8vICAgICAgICAgICBncmFjZWx5RXhpdCgpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICB9KTtcbi8vICAgICAgIGlmICghZHJhaW5lZCkge1xuLy8gICAgICAgICBwcm9jZXNzLnN0ZG91dC5vbihcImRyYWluXCIsIGdyYWNlbHlFeGl0KVxuLy8gICAgICAgfVxuXG5cbi8vICAgICAgIC8vIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEVPTSk7XG4vLyAgICAgfSlcbi8vICAgICBpZiAocHJvY2Vzcy5zZW5kKSB7XG4vLyAgICAgICBwcm9jZXNzLnNlbmQoeyBjbWQ6IFwiaW5pdGVkXCIgfSk7XG4vLyAgICAgfVxuXG5cbi8vICAgfVxuLy8gfVxuLy8gZnVuY3Rpb24gZ3JhY2VseUV4aXQoKXtcbi8vICAgc2V0VGltZW91dCgoKT0+e1xuLy8gICAgIGNvbnYucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4vLyAgICAgcHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbi8vICAgfSw1MCk7XG4vLyB9XG4vLyBmdW5jdGlvbiBwcmVwYXJlUGFyYW1zKHA6IGFueSk6IENTVlBhcnNlUGFyYW0ge1xuLy8gICBpZiAocC5pZ25vcmVDb2x1bW5zKSB7XG4vLyAgICAgcC5pZ25vcmVDb2x1bW5zID0gbmV3IFJlZ0V4cChwLmlnbm9yZUNvbHVtbnMuc291cmNlLCBwLmlnbm9yZUNvbHVtbnMuZmxhZ3MpXG4vLyAgIH1cbi8vICAgaWYgKHAuaW5jbHVkZUNvbHVtbnMpIHtcbi8vICAgICBwLmluY2x1ZGVDb2x1bW5zID0gbmV3IFJlZ0V4cChwLmluY2x1ZGVDb2x1bW5zLnNvdXJjZSwgcC5pbmNsdWRlQ29sdW1ucy5mbGFncylcbi8vICAgfVxuLy8gICByZXR1cm4gcDtcbi8vIH1cblxuLy8gcHJvY2Vzcy5vbihcImRpc2Nvbm5lY3RcIiwgKCkgPT4ge1xuLy8gICBwcm9jZXNzLmV4aXQoLTEpO1xuLy8gfSk7Il19