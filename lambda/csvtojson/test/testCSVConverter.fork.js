"use strict";
// import {Converter} from "../src/Converter";
// import csv from "../src";
// var assert = require("assert");
// var fs = require("fs");
// var sandbox = require("sinon").sandbox.create();
// var file = __dirname + "/data/testData";
// var trailCommaData = __dirname + "/data/trailingComma";
// describe("CSV Convert in Background Process", function () {
//   afterEach(function () {
//     sandbox.restore();
//   });
//   it("should read from a stream", function (done) {
//     var obj = new Converter({
//       fork: true
//     });
//     var stream = fs.createReadStream(file);
//     obj.then(function (obj) {
//       assert.equal(obj.length, 2);
//       done();
//     },(err)=>{
//       console.log(err.toString());
//     });
//     stream.pipe(obj);
//   });
//   it("should call onNext once a row is parsed.", function (done) {
//     var obj = new Converter({fork:true});
//     var stream = fs.createReadStream(file);
//     var called = false;
//     obj.subscribe(function (resultRow) {
//       assert(resultRow);
//       called = true;
//     });
//     obj.on("done", function () {
//       assert(called);
//       done();
//     });
//     stream.pipe(obj);
//   });
//   it("should emit end_parsed message once it is finished.", function (done) {
//     var obj = new Converter({fork:true});
//     obj.then(function (result) {
//       assert(result);
//       assert(result.length === 2);
//       assert(result[0].date);
//       assert(result[0].employee);
//       assert(result[0].employee.name);
//       assert(result[0].employee.age);
//       assert(result[0].employee.number);
//       assert(result[0].employee.key.length === 2);
//       assert(result[0].address.length === 2);
//       done();
//     });
//     fs.createReadStream(file).pipe(obj);
//   });
//   it("should handle traling comma gracefully", function (done) {
//     var stream = fs.createReadStream(trailCommaData);
//     var obj = new Converter({fork:true});
//     obj.then(function (result) {
//       assert(result);
//       assert(result.length > 0);
//       done();
//     });
//     stream.pipe(obj);
//   });
//   it("should handle comma in column which is surrounded by qoutes", function (done) {
//     var testData = __dirname + "/data/dataWithComma";
//     var rs = fs.createReadStream(testData);
//     var obj = new Converter({
//       "quote": "#",
//       "fork":true
//     });
//     obj.then(function (result) {
//       assert(result[0].col1 === "\"Mini. Sectt");
//       assert.equal(result[3].col2, "125001,fenvkdsf");
//       // console.log(result);
//       done();
//     });
//     rs.pipe(obj);
//   });
//   it("should be able to convert a csv to column array data", function (done) {
//     var columArrData = __dirname + "/data/columnArray";
//     var rs = fs.createReadStream(columArrData);
//     var result:any = {};
//     var csvConverter = new Converter({fork:true});
//     //end_parsed will be emitted once parsing finished
//     csvConverter.then(function () {
//       assert(result.TIMESTAMP.length === 5);
//       done();
//     });
//     //record_parsed will be emitted each time a row has been parsed.
//     csvConverter.subscribe(function (resultRow, rowIndex) {
//       for (var key in resultRow) {
//         if (resultRow.hasOwnProperty(key)) {
//           if (!result[key] || !(result[key] instanceof Array)) {
//             result[key] = [];
//           }
//           result[key][rowIndex] = resultRow[key];
//         }
//       }
//     });
//     rs.pipe(csvConverter);
//   });
//   it("should be able to convert csv string directly", function (done) {
//     var testData = __dirname + "/data/testData";
//     var data = fs.readFileSync(testData).toString();
//     var csvConverter = new Converter({fork:true});
//     //end_parsed will be emitted once parsing finished
//     csvConverter.then(function (jsonObj) {
//       assert.equal(jsonObj.length, 2);
//     });
//     csvConverter.fromString(data).then(function (jsonObj) {
//       assert(jsonObj.length === 2);
//       done();
//     });
//   });
//   it("should be able to convert csv string with error", function (done) {
//     var testData = __dirname + "/data/dataWithUnclosedQuotes";
//     var data = fs.readFileSync(testData).toString();
//     var csvConverter = new Converter({fork:true});
//     csvConverter.fromString(data).then(undefined, function (err) {
//       // console.log(err);
//       assert(err);
//       assert.equal(err.err, "unclosed_quote");
//       done();
//     });
//   });
//   it("should be able to convert csv string without callback provided", function (done) {
//     var testData = __dirname + "/data/testData";
//     var data = fs.readFileSync(testData).toString();
//     var csvConverter = new Converter({fork:true});
//     //end_parsed will be emitted once parsing finished
//     csvConverter.then(function (jsonObj) {
//       assert(jsonObj.length === 2);
//       done();
//     });
//     csvConverter.fromString(data);
//   });
//   it("should be able to handle columns with double quotes", function (done) {
//     var testData = __dirname + "/data/dataWithQoutes";
//     var data = fs.readFileSync(testData).toString();
//     var csvConverter = new Converter({fork:true});
//     csvConverter.fromString(data).then(function (jsonObj) {
//       assert(jsonObj[0].TIMESTAMP === '13954264"22', JSON.stringify(jsonObj[0].TIMESTAMP));
//       assert(jsonObj[1].TIMESTAMP === 'abc, def, ccc', JSON.stringify(jsonObj[1].TIMESTAMP));
//       done();
//     });
//   });
//   it("should be able to handle columns with two double quotes", function (done) {
//     var testData = __dirname + "/data/twodoublequotes";
//     var data = fs.readFileSync(testData).toString();
//     var csvConverter = new Converter({fork:true});
//     csvConverter.fromString(data).then(function (jsonObj) {
//       assert.equal(jsonObj[0].title, "\"");
//       assert.equal(jsonObj[0].data, "xyabcde");
//       assert.equal(jsonObj[0].uuid, "fejal\"eifa");
//       assert.equal(jsonObj[0].fieldA, "bnej\"\"falkfe");
//       assert.equal(jsonObj[0].fieldB, "\"eisjfes\"");
//       done();
//     });
//   });
//   it("should handle empty csv file", function (done) {
//     var testData = __dirname + "/data/emptyFile";
//     var rs = fs.createReadStream(testData);
//     var csvConverter = new Converter({fork:true});
//     csvConverter.then(function (jsonObj) {
//       assert(jsonObj.length === 0);
//       done();
//     });
//     rs.pipe(csvConverter);
//   });
//   it("should parse large csv file", function (done) {
//     var testData = __dirname + "/data/large-csv-sample.csv";
//     var rs = fs.createReadStream(testData);
//     var csvConverter = new Converter({fork:true});
//     var count = 0;
//     csvConverter.subscribe(function () {
//       // console.log(arguments);
//       count++;
//     });
//     csvConverter.then(function () {
//       assert.equal(count, 5290);
//       done();
//     });
//     rs.pipe(csvConverter);
//   });
//   it("should parse data and covert to specific types", function (done) {
//     var testData = __dirname + "/data/dataWithType";
//     var rs = fs.createReadStream(testData);
//     var csvConverter = new Converter({
//       fork:true,
//       checkType: true,
//       colParser: {
//         "column6": "string",
//         "column7": "string"
//       }
//     });
//     csvConverter.subscribe(function (d) {
//       assert(typeof d.column1 === "number");
//       assert(typeof d.column2 === "string");
//       assert.equal(d["colume4"], "someinvaliddate");
//       assert(d.column5.hello === "world");
//       assert(d.column6 === '{"hello":"world"}');
//       assert(d.column7 === "1234");
//       assert(d.column8 === "abcd");
//       assert(d.column9 === true);
//       assert(d.column10[0] === 23);
//       assert(d.column10[1] === 31);
//       assert(d.column11[0].hello === "world");
//       assert(d["name#!"] === false);
//     });
//     csvConverter.on("done", function () {
//       done();
//     });
//     rs.pipe(csvConverter);
//   });
//   it("should turn off field type check", function (done) {
//     var testData = __dirname + "/data/dataWithType";
//     var rs = fs.createReadStream(testData);
//     var csvConverter = new Converter({
//       fork:true,
//       checkType: false
//     });
//     csvConverter.subscribe(function (d) {
//       assert(typeof d.column1 === "string");
//       assert(typeof d.column2 === "string");
//       assert(d["column3"] === "2012-01-01");
//       assert(d["colume4"] === "someinvaliddate");
//       assert(d.column5 === '{"hello":"world"}');
//       assert.equal(d["column6"], '{"hello":"world"}');
//       assert(d["column7"] === "1234");
//       assert(d["column8"] === "abcd");
//       assert(d.column9 === "true");
//       assert(d.column10[0] === "23");
//       assert(d.column10[1] === "31");
//       assert(d["name#!"] === 'false');
//     });
//     csvConverter.then(function () {
//       done();
//     });
//     rs.pipe(csvConverter);
//   });
//   it("should emit data event correctly", function (done) {
//     var testData = __dirname + "/data/large-csv-sample.csv";
//     var csvConverter = new Converter({
//       fork:true
//     },{objectMode:true});
//     var count = 0;
//     csvConverter.on("data", function (d) {
//       count++;
//     });
//     csvConverter.on("done", function () {
//       assert.equal(csvConverter.parsedLineNumber, 5290);
//       done();
//     });
//     var rs = fs.createReadStream(testData);
//     rs.pipe(csvConverter);
//   });
//   it("should process column with linebreaks", function (done) {
//     var testData = __dirname + "/data/lineBreak";
//     var rs = fs.createReadStream(testData);
//     var csvConverter = new Converter({
//       fork:true,
//       checkType: true
//     });
//     csvConverter.subscribe(function (d) {
//       assert(d.Period === 13);
//       assert(d["Apparent age"] === "Unknown");
//       done();
//     });
//     rs.pipe(csvConverter);
//   });
//   it("be able to ignore empty columns", function (done) {
//     var testData = __dirname + "/data/dataIgnoreEmpty";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(csv({ 
//       ignoreEmpty: true ,
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 3);
//       assert(j.col2.length === 2);
//       assert(j.col2[1] === "d3");
//       assert(j.col4.col3 === undefined);
//       assert(j.col4.col5 === "world");
//       assert(res[1].col1 === "d2");
//       assert(res[2].col1 === "d4");
//       done();
//     });
//   });
//   it("should allow no header", function (done) {
//     var testData = __dirname + "/data/noheadercsv";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({ 
//       noheader: true,
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 5);
//       assert(j.field1 === "CC102-PDMI-001");
//       assert(j.field2 === "eClass_5.1.3");
//       done();
//     });
//   });
//   it("should allow customised header", function (done) {
//     var testData = __dirname + "/data/noheadercsv";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       noheader: true,
//       headers: ["a", "b"],
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 5);
//       assert(j.a === "CC102-PDMI-001");
//       assert(j.b === "eClass_5.1.3");
//       assert(j.field3 === "10/3/2014");
//       done();
//     });
//   });
//   it("should allow customised header to override existing header", function (done) {
//     var testData = __dirname + "/data/complexJSONCSV";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       headers: [],
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 2);
//       assert(j.field1 === "Food Factory");
//       assert(j.field2 === "Oscar");
//       done();
//     });
//   });
//   it("should handle when there is an empty string", function (done) {
//     var testData = __dirname + "/data/dataWithEmptyString";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       noheader: true,
//       headers: ["a", "b", "c"],
//       checkType: true,
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       // assert(res.length===2);
//       assert(j.a === "green");
//       assert(j.b === 40);
//       assert.equal(j.c, "");
//       done();
//     });
//   });
//   it("should detect eol correctly when first chunk is smaller than header row length", function (done) {
//     var testData = __dirname + "/data/dataNoTrimCRLF";
//     var rs = fs.createReadStream(testData, { highWaterMark: 3 });
//     var st = rs.pipe(new Converter({
//       trim: false,
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 2);
//       assert(j.name === "joe");
//       assert(j.age === "20");
//       assert.equal(res[1].name, "sam");
//       assert.equal(res[1].age, "30");
//       done();
//     });
//   });
//   it("should detect eol correctly when first chunk ends in middle of CRLF line break", function (done) {
//     var testData = __dirname + "/data/dataNoTrimCRLF";
//     var rs = fs.createReadStream(testData, { highWaterMark: 9 });
//     var st = rs.pipe(new Converter({
//       trim: false,
//       fork:true
//     }));
//     st.then(function (res) {
//       var j = res[0];
//       assert(res.length === 2);
//       assert(j.name === "joe");
//       assert(j.age === "20");
//       assert.equal(res[1].name, "sam");
//       assert.equal(res[1].age, "30");
//       done();
//     });
//   });
//   it("should emit eol event when line ending is detected as CRLF", function (done) {
//     var testData = __dirname + "/data/dataNoTrimCRLF";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       fork:true
//     }));
//     var eolCallback = sandbox.spy(function (eol) {
//       assert.equal(eol, "\r\n");
//     });
//     st.on("eol", eolCallback);
//     st.then(function () {
//       assert.equal(eolCallback.callCount, 1, 'should emit eol event once');
//       done();
//     })
//   });
//   it("should emit eol event when line ending is detected as LF", function (done) {
//     var testData = __dirname + "/data/columnArray";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       fork:true
//     }));
//     var eolCallback = sandbox.spy(function (eol) {
//       assert.equal(eol, "\n");
//     });
//     st.on("eol", eolCallback);
//     st.then(function () {
//       assert.equal(eolCallback.callCount, 1, 'should emit eol event once');
//       done();
//     })
//   });
//   it("should remove the Byte Order Mark (BOM) from input", function (done) {
//     var testData = __dirname + "/data/dataNoTrimBOM";
//     var rs = fs.createReadStream(testData);
//     var st = rs.pipe(new Converter({
//       trim: false,
//       fork:true
//     }));
//     st.then( function (res) {
//       var j = res[0];
//       assert(res.length===2);
//       assert(j.name === "joe");
//       assert(j.age === "20");
//       done();
//     });
//   });
//   it("should set output as csv", function (done) {
//     var testData = __dirname + "/data/complexJSONCSV";
//     var rs = fs.createReadStream(testData);
//     var numOfRow = 0;
//     csv({ output: "csv",fork:true })
//       .fromStream(rs)
//       .subscribe(function (row, idx) {
//         numOfRow++;
//         assert(row);
//         assert(idx >= 0);
//       })
//       .on("done", function (error) {
//         assert(!error);
//         assert.equal(2, numOfRow);
//         assert(numOfRow !== 0);
//         done();
//       });
//   });
//   it("should process long header", function (done) {
//     var testData = __dirname + "/data/longHeader";
//     var rs = fs.createReadStream(testData, { highWaterMark: 100 });
//     var numOfRow = 0;
//     var numOfJson = 0;
//     csv({fork:true}, { highWaterMark: 100 })
//       .fromStream(rs)
//       .subscribe(function (res, idx) {
//         numOfJson++;
//         assert.equal(res.Date, '8/26/16');
//         assert(idx >= 0);
//       })
//       .on("done", function () {
//         assert(numOfJson === 1);
//         done();
//       });
//   });
//   it("should parse #139", function (done) {
//     var rs = fs.createReadStream(__dirname + "/data/data#139");
//     csv({fork:true})
//       .fromStream(rs)
//       .then(function (res) {
//         assert.equal(res[1].field3, "9001009395 9001009990");
//         done();
//       });
//   });
//   it("should ignore column", function (done) {
//     var rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
//     var headerEmitted = false;
//     csv({
//       ignoreColumns: /TIMESTAMP/,
//       fork:true
//     })
//       .fromStream(rs)
//       .on("header", function (header) {
//         assert.equal(header.indexOf("TIMESTAMP"), -1);
//         assert.equal(header.indexOf("UPDATE"), 0);
//         if (headerEmitted) {
//           throw ("header event should only happen once")
//         }
//         headerEmitted = true;
//       })
//       // .on("csv", function (row, idx) {
//       //   if (!headerEmitted) {
//       //     throw ("header should be emitted before any data events");
//       //   }
//       //   assert(idx >= 0);
//       //   if (idx === 1) {
//       //     assert.equal(row[0], "n");
//       //   }
//       // })
//       .subscribe(function (j, idx) {
//         // console.log(j);
//         assert(!j.TIMESTAMP);
//         assert(idx >= 0);
//       })
//       .on("done", function (err) {
//         assert(!err);
//         assert(headerEmitted);
//         done();
//       });
//   });
//   it("should include column", function (done) {
//     var rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
//     csv({
//       includeColumns: /TIMESTAMP/,
//       fork:true
//     })
//       .fromStream(rs)
//       .on("header", function (header) {
//         assert.equal(header.indexOf("TIMESTAMP"), 0);
//         assert.equal(header.indexOf("UPDATE"), -1);
//         assert.equal(header.length, 1);
//       })
//       .subscribe(function (j, idx) {
//         assert(idx >= 0);
//         if (idx === 1) {
//           assert.equal(j.TIMESTAMP, "abc, def, ccc");
//         }
//         assert(!j.UID)
//         assert(!j['BYTES SENT'])
//       })
//       .on("done", function () {
//         done();
//       });
//   });
//   it("should allow headers and include columns to be given as reference to the same var", function (done) {
//     var rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
//     var headers = [
//       'first',
//       'second',
//       'third',
//     ];
//     var expected = headers;
//     csv({
//       headers: headers,
//       includeColumns: /(first|second|third)/,
//       fork:true
//     })
//       .fromStream(rs)
//       .on("header", function (header) {
//         expected.forEach(function (value, index) {
//           assert.equal(header.indexOf(value), index);
//         });
//       })
//       .subscribe(function (j, idx) {
//         assert(idx >= 0);
//         assert.equal(expected.length, Object.keys(j).length);
//         expected.forEach(function (attribute) {
//           assert(j.hasOwnProperty(attribute));
//         });
//       })
//       .on("done", function () {
//         done();
//       });
//   });
//   it("should leave provided params objects unmutated", function() {
//     var rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
//     var includeColumns = [
//       'fieldA.title',
//       'description',
//     ];
//     return csv({
//       includeColumns: /(fieldA\.title|description)/,
//       fork:true
//     })
//       .fromStream(rs)
//       .on("json", function(j, idx) {
//         assert(idx >= 0);
//       })
//       .on("header", function(header) {
//         includeColumns.forEach(function (value, index) {
//           assert.equal(index, header.indexOf(value));
//         });
//       })
//   });
//   it("should accept pipe as quote", function (done) {
//     csv({
//       quote: "|",
//       output: "csv",
//       "fork":true
//     })
//       .fromFile(__dirname + "/data/pipeAsQuote")
//       .subscribe(function (csv) {
//         assert.equal(csv[2], "blahhh, blah");
//       })
//       .on('done', function () {
//         done()
//       });
//   })
//   it("should allow async subscribe function", () => {
//     return csv({ trim: true,fork:true })
//       .fromString(`a,b,c
//     1,2,3
//     4,5,6`)
//       .subscribe((d) => {
//         return new Promise((resolve, reject) => {
//           setTimeout(() => {
//             d.a = 10;
//             resolve();
//           }, 20);
//         })
//       })
//       .then((d) => {
//         assert.equal(d[0].a, 10);
//         assert.equal(d[1].a, 10);
//       })
//   })
//   it("should omit a column", () => {
//     return csv({
//       colParser: {
//         "a": "omit"
//       },
//       fork:true
//     })
//       .fromString(`a,b,c
//   1,2,3
//   fefe,5,6`)
//       .then((d) => {
//         assert.strictEqual(d[0].a, undefined);
//         assert.equal(d[1].a, undefined);
//       })
//   })
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENTVkNvbnZlcnRlci5mb3JrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVzdENTVkNvbnZlcnRlci5mb3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw4Q0FBOEM7QUFDOUMsNEJBQTRCO0FBQzVCLGtDQUFrQztBQUNsQywwQkFBMEI7QUFDMUIsbURBQW1EO0FBQ25ELDJDQUEyQztBQUMzQywwREFBMEQ7QUFDMUQsOERBQThEO0FBQzlELDRCQUE0QjtBQUM1Qix5QkFBeUI7QUFDekIsUUFBUTtBQUdSLHNEQUFzRDtBQUN0RCxnQ0FBZ0M7QUFDaEMsbUJBQW1CO0FBQ25CLFVBQVU7QUFDViw4Q0FBOEM7QUFDOUMsZ0NBQWdDO0FBQ2hDLHFDQUFxQztBQUNyQyxnQkFBZ0I7QUFDaEIsaUJBQWlCO0FBQ2pCLHFDQUFxQztBQUNyQyxVQUFVO0FBQ1Ysd0JBQXdCO0FBQ3hCLFFBQVE7QUFFUixxRUFBcUU7QUFDckUsNENBQTRDO0FBQzVDLDhDQUE4QztBQUM5QywwQkFBMEI7QUFDMUIsMkNBQTJDO0FBQzNDLDJCQUEyQjtBQUMzQix1QkFBdUI7QUFDdkIsVUFBVTtBQUNWLG1DQUFtQztBQUNuQyx3QkFBd0I7QUFDeEIsZ0JBQWdCO0FBQ2hCLFVBQVU7QUFDVix3QkFBd0I7QUFDeEIsUUFBUTtBQUVSLGdGQUFnRjtBQUNoRiw0Q0FBNEM7QUFDNUMsbUNBQW1DO0FBQ25DLHdCQUF3QjtBQUN4QixxQ0FBcUM7QUFDckMsZ0NBQWdDO0FBQ2hDLG9DQUFvQztBQUNwQyx5Q0FBeUM7QUFDekMsd0NBQXdDO0FBQ3hDLDJDQUEyQztBQUMzQyxxREFBcUQ7QUFDckQsZ0RBQWdEO0FBQ2hELGdCQUFnQjtBQUNoQixVQUFVO0FBQ1YsMkNBQTJDO0FBQzNDLFFBQVE7QUFFUixtRUFBbUU7QUFDbkUsd0RBQXdEO0FBQ3hELDRDQUE0QztBQUM1QyxtQ0FBbUM7QUFDbkMsd0JBQXdCO0FBQ3hCLG1DQUFtQztBQUNuQyxnQkFBZ0I7QUFDaEIsVUFB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N0Isd0JBQXdCO0FBQ3hCLHVCQUF1QjtBQUN2QixTQUFTO0FBR1QsbUJBQW1CO0FBQ25CLHVEQUF1RDtBQUN2RCxrQkFBa0I7QUFDbEIsU0FBUztBQUNULHdCQUF3QjtBQUN4Qix1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBQzVCLFdBQVc7QUFDWCx5Q0FBeUM7QUFDekMsMkRBQTJEO0FBQzNELHdEQUF3RDtBQUN4RCxjQUFjO0FBQ2QsV0FBVztBQUNYLFFBQVE7QUFDUix3REFBd0Q7QUFDeEQsWUFBWTtBQUNaLG9CQUFvQjtBQUNwQix1QkFBdUI7QUFDdkIsb0JBQW9CO0FBQ3BCLFNBQVM7QUFDVCxtREFBbUQ7QUFDbkQsb0NBQW9DO0FBQ3BDLGdEQUFnRDtBQUNoRCxXQUFXO0FBQ1gsa0NBQWtDO0FBQ2xDLGlCQUFpQjtBQUNqQixZQUFZO0FBQ1osT0FBTztBQUNQLHdEQUF3RDtBQUN4RCwyQ0FBMkM7QUFDM0MsMkJBQTJCO0FBQzNCLFlBQVk7QUFDWixjQUFjO0FBQ2QsNEJBQTRCO0FBQzVCLG9EQUFvRDtBQUNwRCwrQkFBK0I7QUFDL0Isd0JBQXdCO0FBQ3hCLHlCQUF5QjtBQUN6QixvQkFBb0I7QUFDcEIsYUFBYTtBQUNiLFdBQVc7QUFDWCx1QkFBdUI7QUFDdkIsb0NBQW9DO0FBQ3BDLG9DQUFvQztBQUNwQyxXQUFXO0FBQ1gsT0FBTztBQUNQLHVDQUF1QztBQUN2QyxtQkFBbUI7QUFDbkIscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixXQUFXO0FBQ1gsa0JBQWtCO0FBQ2xCLFNBQVM7QUFDVCwyQkFBMkI7QUFDM0IsVUFBVTtBQUNWLGVBQWU7QUFDZix1QkFBdUI7QUFDdkIsaURBQWlEO0FBQ2pELDJDQUEyQztBQUMzQyxXQUFXO0FBQ1gsT0FBTztBQUVQLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQge0NvbnZlcnRlcn0gZnJvbSBcIi4uL3NyYy9Db252ZXJ0ZXJcIjtcbi8vIGltcG9ydCBjc3YgZnJvbSBcIi4uL3NyY1wiO1xuLy8gdmFyIGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG4vLyB2YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG4vLyB2YXIgc2FuZGJveCA9IHJlcXVpcmUoXCJzaW5vblwiKS5zYW5kYm94LmNyZWF0ZSgpO1xuLy8gdmFyIGZpbGUgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3Rlc3REYXRhXCI7XG4vLyB2YXIgdHJhaWxDb21tYURhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3RyYWlsaW5nQ29tbWFcIjtcbi8vIGRlc2NyaWJlKFwiQ1NWIENvbnZlcnQgaW4gQmFja2dyb3VuZCBQcm9jZXNzXCIsIGZ1bmN0aW9uICgpIHtcbi8vICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcbi8vICAgICBzYW5kYm94LnJlc3RvcmUoKTtcbi8vICAgfSk7XG5cblxuLy8gICBpdChcInNob3VsZCByZWFkIGZyb20gYSBzdHJlYW1cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgb2JqID0gbmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBmb3JrOiB0cnVlXG4vLyAgICAgfSk7XG4vLyAgICAgdmFyIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSk7XG4vLyAgICAgb2JqLnRoZW4oZnVuY3Rpb24gKG9iaikge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKG9iai5sZW5ndGgsIDIpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0sKGVycik9Pntcbi8vICAgICAgIGNvbnNvbGUubG9nKGVyci50b1N0cmluZygpKTtcbi8vICAgICB9KTtcbi8vICAgICBzdHJlYW0ucGlwZShvYmopO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBjYWxsIG9uTmV4dCBvbmNlIGEgcm93IGlzIHBhcnNlZC5cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgb2JqID0gbmV3IENvbnZlcnRlcih7Zm9yazp0cnVlfSk7XG4vLyAgICAgdmFyIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSk7XG4vLyAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuLy8gICAgIG9iai5zdWJzY3JpYmUoZnVuY3Rpb24gKHJlc3VsdFJvdykge1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFJvdyk7XG4vLyAgICAgICBjYWxsZWQgPSB0cnVlO1xuLy8gICAgIH0pO1xuLy8gICAgIG9iai5vbihcImRvbmVcIiwgZnVuY3Rpb24gKCkge1xuLy8gICAgICAgYXNzZXJ0KGNhbGxlZCk7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgICAgc3RyZWFtLnBpcGUob2JqKTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgZW1pdCBlbmRfcGFyc2VkIG1lc3NhZ2Ugb25jZSBpdCBpcyBmaW5pc2hlZC5cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgb2JqID0gbmV3IENvbnZlcnRlcih7Zm9yazp0cnVlfSk7XG4vLyAgICAgb2JqLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdCk7XG4vLyAgICAgICBhc3NlcnQocmVzdWx0Lmxlbmd0aCA9PT0gMik7XG4vLyAgICAgICBhc3NlcnQocmVzdWx0WzBdLmRhdGUpO1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFswXS5lbXBsb3llZSk7XG4vLyAgICAgICBhc3NlcnQocmVzdWx0WzBdLmVtcGxveWVlLm5hbWUpO1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFswXS5lbXBsb3llZS5hZ2UpO1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFswXS5lbXBsb3llZS5udW1iZXIpO1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFswXS5lbXBsb3llZS5rZXkubGVuZ3RoID09PSAyKTtcbi8vICAgICAgIGFzc2VydChyZXN1bHRbMF0uYWRkcmVzcy5sZW5ndGggPT09IDIpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSkucGlwZShvYmopO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBoYW5kbGUgdHJhbGluZyBjb21tYSBncmFjZWZ1bGx5XCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odHJhaWxDb21tYURhdGEpO1xuLy8gICAgIHZhciBvYmogPSBuZXcgQ29udmVydGVyKHtmb3JrOnRydWV9KTtcbi8vICAgICBvYmoudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4vLyAgICAgICBhc3NlcnQocmVzdWx0KTtcbi8vICAgICAgIGFzc2VydChyZXN1bHQubGVuZ3RoID4gMCk7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgICAgc3RyZWFtLnBpcGUob2JqKTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgaGFuZGxlIGNvbW1hIGluIGNvbHVtbiB3aGljaCBpcyBzdXJyb3VuZGVkIGJ5IHFvdXRlc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhDb21tYVwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBvYmogPSBuZXcgQ29udmVydGVyKHtcbi8vICAgICAgIFwicXVvdGVcIjogXCIjXCIsXG4vLyAgICAgICBcImZvcmtcIjp0cnVlXG4vLyAgICAgfSk7XG4vLyAgICAgb2JqLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuLy8gICAgICAgYXNzZXJ0KHJlc3VsdFswXS5jb2wxID09PSBcIlxcXCJNaW5pLiBTZWN0dFwiKTtcbi8vICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbM10uY29sMiwgXCIxMjUwMDEsZmVudmtkc2ZcIik7XG4vLyAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICAgIHJzLnBpcGUob2JqKTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IGEgY3N2IHRvIGNvbHVtbiBhcnJheSBkYXRhXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIGNvbHVtQXJyRGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvY29sdW1uQXJyYXlcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGNvbHVtQXJyRGF0YSk7XG4vLyAgICAgdmFyIHJlc3VsdDphbnkgPSB7fTtcbi8vICAgICB2YXIgY3N2Q29udmVydGVyID0gbmV3IENvbnZlcnRlcih7Zm9yazp0cnVlfSk7XG4vLyAgICAgLy9lbmRfcGFyc2VkIHdpbGwgYmUgZW1pdHRlZCBvbmNlIHBhcnNpbmcgZmluaXNoZWRcbi8vICAgICBjc3ZDb252ZXJ0ZXIudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICBhc3NlcnQocmVzdWx0LlRJTUVTVEFNUC5sZW5ndGggPT09IDUpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuXG4vLyAgICAgLy9yZWNvcmRfcGFyc2VkIHdpbGwgYmUgZW1pdHRlZCBlYWNoIHRpbWUgYSByb3cgaGFzIGJlZW4gcGFyc2VkLlxuLy8gICAgIGNzdkNvbnZlcnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHJlc3VsdFJvdywgcm93SW5kZXgpIHtcbi8vICAgICAgIGZvciAodmFyIGtleSBpbiByZXN1bHRSb3cpIHtcbi8vICAgICAgICAgaWYgKHJlc3VsdFJvdy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4vLyAgICAgICAgICAgaWYgKCFyZXN1bHRba2V5XSB8fCAhKHJlc3VsdFtrZXldIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4vLyAgICAgICAgICAgICByZXN1bHRba2V5XSA9IFtdO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgICByZXN1bHRba2V5XVtyb3dJbmRleF0gPSByZXN1bHRSb3dba2V5XTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy8gICAgIHJzLnBpcGUoY3N2Q29udmVydGVyKTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IGNzdiBzdHJpbmcgZGlyZWN0bHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3Rlc3REYXRhXCI7XG4vLyAgICAgdmFyIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmModGVzdERhdGEpLnRvU3RyaW5nKCk7XG4vLyAgICAgdmFyIGNzdkNvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIoe2Zvcms6dHJ1ZX0pO1xuLy8gICAgIC8vZW5kX3BhcnNlZCB3aWxsIGJlIGVtaXR0ZWQgb25jZSBwYXJzaW5nIGZpbmlzaGVkXG4vLyAgICAgY3N2Q29udmVydGVyLnRoZW4oZnVuY3Rpb24gKGpzb25PYmopIHtcbi8vICAgICAgIGFzc2VydC5lcXVhbChqc29uT2JqLmxlbmd0aCwgMik7XG4vLyAgICAgfSk7XG4vLyAgICAgY3N2Q29udmVydGVyLmZyb21TdHJpbmcoZGF0YSkudGhlbihmdW5jdGlvbiAoanNvbk9iaikge1xuLy8gICAgICAgYXNzZXJ0KGpzb25PYmoubGVuZ3RoID09PSAyKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IGNzdiBzdHJpbmcgd2l0aCBlcnJvclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhVbmNsb3NlZFF1b3Rlc1wiO1xuLy8gICAgIHZhciBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHRlc3REYXRhKS50b1N0cmluZygpO1xuLy8gICAgIHZhciBjc3ZDb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtmb3JrOnRydWV9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIuZnJvbVN0cmluZyhkYXRhKS50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGVycikge1xuLy8gICAgICAgLy8gY29uc29sZS5sb2coZXJyKTtcbi8vICAgICAgIGFzc2VydChlcnIpO1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGVyci5lcnIsIFwidW5jbG9zZWRfcXVvdGVcIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGJlIGFibGUgdG8gY29udmVydCBjc3Ygc3RyaW5nIHdpdGhvdXQgY2FsbGJhY2sgcHJvdmlkZWRcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3Rlc3REYXRhXCI7XG4vLyAgICAgdmFyIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmModGVzdERhdGEpLnRvU3RyaW5nKCk7XG4vLyAgICAgdmFyIGNzdkNvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIoe2Zvcms6dHJ1ZX0pO1xuLy8gICAgIC8vZW5kX3BhcnNlZCB3aWxsIGJlIGVtaXR0ZWQgb25jZSBwYXJzaW5nIGZpbmlzaGVkXG4vLyAgICAgY3N2Q29udmVydGVyLnRoZW4oZnVuY3Rpb24gKGpzb25PYmopIHtcbi8vICAgICAgIGFzc2VydChqc29uT2JqLmxlbmd0aCA9PT0gMik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgICAgY3N2Q29udmVydGVyLmZyb21TdHJpbmcoZGF0YSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGJlIGFibGUgdG8gaGFuZGxlIGNvbHVtbnMgd2l0aCBkb3VibGUgcXVvdGVzXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aFFvdXRlc1wiO1xuLy8gICAgIHZhciBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHRlc3REYXRhKS50b1N0cmluZygpO1xuLy8gICAgIHZhciBjc3ZDb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtmb3JrOnRydWV9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIuZnJvbVN0cmluZyhkYXRhKS50aGVuKGZ1bmN0aW9uIChqc29uT2JqKSB7XG4vLyAgICAgICBhc3NlcnQoanNvbk9ialswXS5USU1FU1RBTVAgPT09ICcxMzk1NDI2NFwiMjInLCBKU09OLnN0cmluZ2lmeShqc29uT2JqWzBdLlRJTUVTVEFNUCkpO1xuXG4vLyAgICAgICBhc3NlcnQoanNvbk9ialsxXS5USU1FU1RBTVAgPT09ICdhYmMsIGRlZiwgY2NjJywgSlNPTi5zdHJpbmdpZnkoanNvbk9ialsxXS5USU1FU1RBTVApKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgYmUgYWJsZSB0byBoYW5kbGUgY29sdW1ucyB3aXRoIHR3byBkb3VibGUgcXVvdGVzXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS90d29kb3VibGVxdW90ZXNcIjtcbi8vICAgICB2YXIgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyh0ZXN0RGF0YSkudG9TdHJpbmcoKTtcbi8vICAgICB2YXIgY3N2Q29udmVydGVyID0gbmV3IENvbnZlcnRlcih7Zm9yazp0cnVlfSk7XG4vLyAgICAgY3N2Q29udmVydGVyLmZyb21TdHJpbmcoZGF0YSkudGhlbihmdW5jdGlvbiAoanNvbk9iaikge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGpzb25PYmpbMF0udGl0bGUsIFwiXFxcIlwiKTtcbi8vICAgICAgIGFzc2VydC5lcXVhbChqc29uT2JqWzBdLmRhdGEsIFwieHlhYmNkZVwiKTtcbi8vICAgICAgIGFzc2VydC5lcXVhbChqc29uT2JqWzBdLnV1aWQsIFwiZmVqYWxcXFwiZWlmYVwiKTtcbi8vICAgICAgIGFzc2VydC5lcXVhbChqc29uT2JqWzBdLmZpZWxkQSwgXCJibmVqXFxcIlxcXCJmYWxrZmVcIik7XG4vLyAgICAgICBhc3NlcnQuZXF1YWwoanNvbk9ialswXS5maWVsZEIsIFwiXFxcImVpc2pmZXNcXFwiXCIpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBoYW5kbGUgZW1wdHkgY3N2IGZpbGVcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2VtcHR5RmlsZVwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBjc3ZDb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtmb3JrOnRydWV9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIudGhlbihmdW5jdGlvbiAoanNvbk9iaikge1xuLy8gICAgICAgYXNzZXJ0KGpzb25PYmoubGVuZ3RoID09PSAwKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgICBycy5waXBlKGNzdkNvbnZlcnRlcik7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIHBhcnNlIGxhcmdlIGNzdiBmaWxlXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9sYXJnZS1jc3Ytc2FtcGxlLmNzdlwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBjc3ZDb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtmb3JrOnRydWV9KTtcbi8vICAgICB2YXIgY291bnQgPSAwO1xuLy8gICAgIGNzdkNvbnZlcnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xuLy8gICAgICAgLy8gY29uc29sZS5sb2coYXJndW1lbnRzKTtcbi8vICAgICAgIGNvdW50Kys7XG4vLyAgICAgfSk7XG4vLyAgICAgY3N2Q29udmVydGVyLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGNvdW50LCA1MjkwKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgICBycy5waXBlKGNzdkNvbnZlcnRlcik7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIHBhcnNlIGRhdGEgYW5kIGNvdmVydCB0byBzcGVjaWZpYyB0eXBlc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhUeXBlXCI7XG4vLyAgICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4vLyAgICAgdmFyIGNzdkNvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIoe1xuLy8gICAgICAgZm9yazp0cnVlLFxuLy8gICAgICAgY2hlY2tUeXBlOiB0cnVlLFxuLy8gICAgICAgY29sUGFyc2VyOiB7XG4vLyAgICAgICAgIFwiY29sdW1uNlwiOiBcInN0cmluZ1wiLFxuLy8gICAgICAgICBcImNvbHVtbjdcIjogXCJzdHJpbmdcIlxuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy8gICAgIGNzdkNvbnZlcnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKGQpIHtcbi8vICAgICAgIGFzc2VydCh0eXBlb2YgZC5jb2x1bW4xID09PSBcIm51bWJlclwiKTtcbi8vICAgICAgIGFzc2VydCh0eXBlb2YgZC5jb2x1bW4yID09PSBcInN0cmluZ1wiKTtcbi8vICAgICAgIGFzc2VydC5lcXVhbChkW1wiY29sdW1lNFwiXSwgXCJzb21laW52YWxpZGRhdGVcIik7XG4vLyAgICAgICBhc3NlcnQoZC5jb2x1bW41LmhlbGxvID09PSBcIndvcmxkXCIpO1xuLy8gICAgICAgYXNzZXJ0KGQuY29sdW1uNiA9PT0gJ3tcImhlbGxvXCI6XCJ3b3JsZFwifScpO1xuLy8gICAgICAgYXNzZXJ0KGQuY29sdW1uNyA9PT0gXCIxMjM0XCIpO1xuLy8gICAgICAgYXNzZXJ0KGQuY29sdW1uOCA9PT0gXCJhYmNkXCIpO1xuLy8gICAgICAgYXNzZXJ0KGQuY29sdW1uOSA9PT0gdHJ1ZSk7XG4vLyAgICAgICBhc3NlcnQoZC5jb2x1bW4xMFswXSA9PT0gMjMpO1xuLy8gICAgICAgYXNzZXJ0KGQuY29sdW1uMTBbMV0gPT09IDMxKTtcbi8vICAgICAgIGFzc2VydChkLmNvbHVtbjExWzBdLmhlbGxvID09PSBcIndvcmxkXCIpO1xuLy8gICAgICAgYXNzZXJ0KGRbXCJuYW1lIyFcIl0gPT09IGZhbHNlKTtcbi8vICAgICB9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIub24oXCJkb25lXCIsIGZ1bmN0aW9uICgpIHtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgICBycy5waXBlKGNzdkNvbnZlcnRlcik7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIHR1cm4gb2ZmIGZpZWxkIHR5cGUgY2hlY2tcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2RhdGFXaXRoVHlwZVwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBjc3ZDb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtcbi8vICAgICAgIGZvcms6dHJ1ZSxcbi8vICAgICAgIGNoZWNrVHlwZTogZmFsc2Vcbi8vICAgICB9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChkKSB7XG4vLyAgICAgICBhc3NlcnQodHlwZW9mIGQuY29sdW1uMSA9PT0gXCJzdHJpbmdcIik7XG4vLyAgICAgICBhc3NlcnQodHlwZW9mIGQuY29sdW1uMiA9PT0gXCJzdHJpbmdcIik7XG4vLyAgICAgICBhc3NlcnQoZFtcImNvbHVtbjNcIl0gPT09IFwiMjAxMi0wMS0wMVwiKTtcbi8vICAgICAgIGFzc2VydChkW1wiY29sdW1lNFwiXSA9PT0gXCJzb21laW52YWxpZGRhdGVcIik7XG4vLyAgICAgICBhc3NlcnQoZC5jb2x1bW41ID09PSAne1wiaGVsbG9cIjpcIndvcmxkXCJ9Jyk7XG4vLyAgICAgICBhc3NlcnQuZXF1YWwoZFtcImNvbHVtbjZcIl0sICd7XCJoZWxsb1wiOlwid29ybGRcIn0nKTtcbi8vICAgICAgIGFzc2VydChkW1wiY29sdW1uN1wiXSA9PT0gXCIxMjM0XCIpO1xuLy8gICAgICAgYXNzZXJ0KGRbXCJjb2x1bW44XCJdID09PSBcImFiY2RcIik7XG4vLyAgICAgICBhc3NlcnQoZC5jb2x1bW45ID09PSBcInRydWVcIik7XG4vLyAgICAgICBhc3NlcnQoZC5jb2x1bW4xMFswXSA9PT0gXCIyM1wiKTtcbi8vICAgICAgIGFzc2VydChkLmNvbHVtbjEwWzFdID09PSBcIjMxXCIpO1xuLy8gICAgICAgYXNzZXJ0KGRbXCJuYW1lIyFcIl0gPT09ICdmYWxzZScpO1xuLy8gICAgIH0pO1xuLy8gICAgIGNzdkNvbnZlcnRlci50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgICBycy5waXBlKGNzdkNvbnZlcnRlcik7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGVtaXQgZGF0YSBldmVudCBjb3JyZWN0bHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2xhcmdlLWNzdi1zYW1wbGUuY3N2XCI7XG5cbi8vICAgICB2YXIgY3N2Q29udmVydGVyID0gbmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9LHtvYmplY3RNb2RlOnRydWV9KTtcbi8vICAgICB2YXIgY291bnQgPSAwO1xuLy8gICAgIGNzdkNvbnZlcnRlci5vbihcImRhdGFcIiwgZnVuY3Rpb24gKGQpIHtcbi8vICAgICAgIGNvdW50Kys7XG4vLyAgICAgfSk7XG4vLyAgICAgY3N2Q29udmVydGVyLm9uKFwiZG9uZVwiLCBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICBhc3NlcnQuZXF1YWwoY3N2Q29udmVydGVyLnBhcnNlZExpbmVOdW1iZXIsIDUyOTApO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHJzLnBpcGUoY3N2Q29udmVydGVyKTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgcHJvY2VzcyBjb2x1bW4gd2l0aCBsaW5lYnJlYWtzXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9saW5lQnJlYWtcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbi8vICAgICB2YXIgY3N2Q29udmVydGVyID0gbmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBmb3JrOnRydWUsXG4vLyAgICAgICBjaGVja1R5cGU6IHRydWVcbi8vICAgICB9KTtcbi8vICAgICBjc3ZDb252ZXJ0ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChkKSB7XG4vLyAgICAgICBhc3NlcnQoZC5QZXJpb2QgPT09IDEzKTtcbi8vICAgICAgIGFzc2VydChkW1wiQXBwYXJlbnQgYWdlXCJdID09PSBcIlVua25vd25cIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgICAgcnMucGlwZShjc3ZDb252ZXJ0ZXIpO1xuLy8gICB9KTtcblxuLy8gICBpdChcImJlIGFibGUgdG8gaWdub3JlIGVtcHR5IGNvbHVtbnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2RhdGFJZ25vcmVFbXB0eVwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUoY3N2KHsgXG4vLyAgICAgICBpZ25vcmVFbXB0eTogdHJ1ZSAsXG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KSk7XG4vLyAgICAgc3QudGhlbihmdW5jdGlvbiAocmVzKSB7XG4vLyAgICAgICB2YXIgaiA9IHJlc1swXTtcbi8vICAgICAgIGFzc2VydChyZXMubGVuZ3RoID09PSAzKTtcbi8vICAgICAgIGFzc2VydChqLmNvbDIubGVuZ3RoID09PSAyKTtcbi8vICAgICAgIGFzc2VydChqLmNvbDJbMV0gPT09IFwiZDNcIik7XG4vLyAgICAgICBhc3NlcnQoai5jb2w0LmNvbDMgPT09IHVuZGVmaW5lZCk7XG4vLyAgICAgICBhc3NlcnQoai5jb2w0LmNvbDUgPT09IFwid29ybGRcIik7XG4vLyAgICAgICBhc3NlcnQocmVzWzFdLmNvbDEgPT09IFwiZDJcIik7XG4vLyAgICAgICBhc3NlcnQocmVzWzJdLmNvbDEgPT09IFwiZDRcIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGFsbG93IG5vIGhlYWRlclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvbm9oZWFkZXJjc3ZcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbi8vICAgICB2YXIgc3QgPSBycy5waXBlKG5ldyBDb252ZXJ0ZXIoeyBcbi8vICAgICAgIG5vaGVhZGVyOiB0cnVlLFxuLy8gICAgICAgZm9yazp0cnVlXG4vLyAgICAgfSkpO1xuLy8gICAgIHN0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuLy8gICAgICAgdmFyIGogPSByZXNbMF07XG4vLyAgICAgICBhc3NlcnQocmVzLmxlbmd0aCA9PT0gNSk7XG4vLyAgICAgICBhc3NlcnQoai5maWVsZDEgPT09IFwiQ0MxMDItUERNSS0wMDFcIik7XG4vLyAgICAgICBhc3NlcnQoai5maWVsZDIgPT09IFwiZUNsYXNzXzUuMS4zXCIpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBhbGxvdyBjdXN0b21pc2VkIGhlYWRlclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvbm9oZWFkZXJjc3ZcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbi8vICAgICB2YXIgc3QgPSBycy5waXBlKG5ldyBDb252ZXJ0ZXIoe1xuLy8gICAgICAgbm9oZWFkZXI6IHRydWUsXG4vLyAgICAgICBoZWFkZXJzOiBbXCJhXCIsIFwiYlwiXSxcbi8vICAgICAgIGZvcms6dHJ1ZVxuLy8gICAgIH0pKTtcbi8vICAgICBzdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbi8vICAgICAgIHZhciBqID0gcmVzWzBdO1xuLy8gICAgICAgYXNzZXJ0KHJlcy5sZW5ndGggPT09IDUpO1xuLy8gICAgICAgYXNzZXJ0KGouYSA9PT0gXCJDQzEwMi1QRE1JLTAwMVwiKTtcbi8vICAgICAgIGFzc2VydChqLmIgPT09IFwiZUNsYXNzXzUuMS4zXCIpO1xuLy8gICAgICAgYXNzZXJ0KGouZmllbGQzID09PSBcIjEwLzMvMjAxNFwiKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgYWxsb3cgY3VzdG9taXNlZCBoZWFkZXIgdG8gb3ZlcnJpZGUgZXhpc3RpbmcgaGVhZGVyXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9jb21wbGV4SlNPTkNTVlwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBoZWFkZXJzOiBbXSxcbi8vICAgICAgIGZvcms6dHJ1ZVxuLy8gICAgIH0pKTtcbi8vICAgICBzdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbi8vICAgICAgIHZhciBqID0gcmVzWzBdO1xuLy8gICAgICAgYXNzZXJ0KHJlcy5sZW5ndGggPT09IDIpO1xuLy8gICAgICAgYXNzZXJ0KGouZmllbGQxID09PSBcIkZvb2QgRmFjdG9yeVwiKTtcbi8vICAgICAgIGFzc2VydChqLmZpZWxkMiA9PT0gXCJPc2NhclwiKTtcbi8vICAgICAgIGRvbmUoKTtcbi8vICAgICB9KTtcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgaGFuZGxlIHdoZW4gdGhlcmUgaXMgYW4gZW1wdHkgc3RyaW5nXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aEVtcHR5U3RyaW5nXCI7XG4vLyAgICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4vLyAgICAgdmFyIHN0ID0gcnMucGlwZShuZXcgQ29udmVydGVyKHtcbi8vICAgICAgIG5vaGVhZGVyOiB0cnVlLFxuLy8gICAgICAgaGVhZGVyczogW1wiYVwiLCBcImJcIiwgXCJjXCJdLFxuLy8gICAgICAgY2hlY2tUeXBlOiB0cnVlLFxuLy8gICAgICAgZm9yazp0cnVlXG4vLyAgICAgfSkpO1xuLy8gICAgIHN0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuLy8gICAgICAgdmFyIGogPSByZXNbMF07XG5cbi8vICAgICAgIC8vIGFzc2VydChyZXMubGVuZ3RoPT09Mik7XG4vLyAgICAgICBhc3NlcnQoai5hID09PSBcImdyZWVuXCIpO1xuLy8gICAgICAgYXNzZXJ0KGouYiA9PT0gNDApO1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGouYywgXCJcIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGRldGVjdCBlb2wgY29ycmVjdGx5IHdoZW4gZmlyc3QgY2h1bmsgaXMgc21hbGxlciB0aGFuIGhlYWRlciByb3cgbGVuZ3RoXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhTm9UcmltQ1JMRlwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEsIHsgaGlnaFdhdGVyTWFyazogMyB9KTtcblxuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICB0cmltOiBmYWxzZSxcbi8vICAgICAgIGZvcms6dHJ1ZVxuLy8gICAgIH0pKTtcbi8vICAgICBzdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbi8vICAgICAgIHZhciBqID0gcmVzWzBdO1xuLy8gICAgICAgYXNzZXJ0KHJlcy5sZW5ndGggPT09IDIpO1xuLy8gICAgICAgYXNzZXJ0KGoubmFtZSA9PT0gXCJqb2VcIik7XG4vLyAgICAgICBhc3NlcnQoai5hZ2UgPT09IFwiMjBcIik7XG4vLyAgICAgICBhc3NlcnQuZXF1YWwocmVzWzFdLm5hbWUsIFwic2FtXCIpO1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKHJlc1sxXS5hZ2UsIFwiMzBcIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGRldGVjdCBlb2wgY29ycmVjdGx5IHdoZW4gZmlyc3QgY2h1bmsgZW5kcyBpbiBtaWRkbGUgb2YgQ1JMRiBsaW5lIGJyZWFrXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhTm9UcmltQ1JMRlwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEsIHsgaGlnaFdhdGVyTWFyazogOSB9KTtcblxuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICB0cmltOiBmYWxzZSxcbi8vICAgICAgIGZvcms6dHJ1ZVxuLy8gICAgIH0pKTtcbi8vICAgICBzdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbi8vICAgICAgIHZhciBqID0gcmVzWzBdO1xuLy8gICAgICAgYXNzZXJ0KHJlcy5sZW5ndGggPT09IDIpO1xuLy8gICAgICAgYXNzZXJ0KGoubmFtZSA9PT0gXCJqb2VcIik7XG4vLyAgICAgICBhc3NlcnQoai5hZ2UgPT09IFwiMjBcIik7XG4vLyAgICAgICBhc3NlcnQuZXF1YWwocmVzWzFdLm5hbWUsIFwic2FtXCIpO1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKHJlc1sxXS5hZ2UsIFwiMzBcIik7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGVtaXQgZW9sIGV2ZW50IHdoZW4gbGluZSBlbmRpbmcgaXMgZGV0ZWN0ZWQgYXMgQ1JMRlwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YU5vVHJpbUNSTEZcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcblxuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KSk7XG4vLyAgICAgdmFyIGVvbENhbGxiYWNrID0gc2FuZGJveC5zcHkoZnVuY3Rpb24gKGVvbCkge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGVvbCwgXCJcXHJcXG5cIik7XG4vLyAgICAgfSk7XG4vLyAgICAgc3Qub24oXCJlb2xcIiwgZW9sQ2FsbGJhY2spO1xuLy8gICAgIHN0LnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGVvbENhbGxiYWNrLmNhbGxDb3VudCwgMSwgJ3Nob3VsZCBlbWl0IGVvbCBldmVudCBvbmNlJyk7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSlcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgZW1pdCBlb2wgZXZlbnQgd2hlbiBsaW5lIGVuZGluZyBpcyBkZXRlY3RlZCBhcyBMRlwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvY29sdW1uQXJyYXlcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcblxuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KSk7XG4vLyAgICAgdmFyIGVvbENhbGxiYWNrID0gc2FuZGJveC5zcHkoZnVuY3Rpb24gKGVvbCkge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGVvbCwgXCJcXG5cIik7XG4vLyAgICAgfSk7XG4vLyAgICAgc3Qub24oXCJlb2xcIiwgZW9sQ2FsbGJhY2spO1xuLy8gICAgIHN0LnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAgYXNzZXJ0LmVxdWFsKGVvbENhbGxiYWNrLmNhbGxDb3VudCwgMSwgJ3Nob3VsZCBlbWl0IGVvbCBldmVudCBvbmNlJyk7XG4vLyAgICAgICBkb25lKCk7XG4vLyAgICAgfSlcbi8vICAgfSk7XG5cbi8vICAgaXQoXCJzaG91bGQgcmVtb3ZlIHRoZSBCeXRlIE9yZGVyIE1hcmsgKEJPTSkgZnJvbSBpbnB1dFwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YU5vVHJpbUJPTVwiO1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuLy8gICAgIHZhciBzdCA9IHJzLnBpcGUobmV3IENvbnZlcnRlcih7XG4vLyAgICAgICB0cmltOiBmYWxzZSxcbi8vICAgICAgIGZvcms6dHJ1ZVxuLy8gICAgIH0pKTtcbi8vICAgICBzdC50aGVuKCBmdW5jdGlvbiAocmVzKSB7XG4vLyAgICAgICB2YXIgaiA9IHJlc1swXTtcblxuLy8gICAgICAgYXNzZXJ0KHJlcy5sZW5ndGg9PT0yKTtcbi8vICAgICAgIGFzc2VydChqLm5hbWUgPT09IFwiam9lXCIpO1xuLy8gICAgICAgYXNzZXJ0KGouYWdlID09PSBcIjIwXCIpO1xuLy8gICAgICAgZG9uZSgpO1xuLy8gICAgIH0pO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBzZXQgb3V0cHV0IGFzIGNzdlwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvY29tcGxleEpTT05DU1ZcIjtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbi8vICAgICB2YXIgbnVtT2ZSb3cgPSAwO1xuLy8gICAgIGNzdih7IG91dHB1dDogXCJjc3ZcIixmb3JrOnRydWUgfSlcbi8vICAgICAgIC5mcm9tU3RyZWFtKHJzKVxuLy8gICAgICAgLnN1YnNjcmliZShmdW5jdGlvbiAocm93LCBpZHgpIHtcbi8vICAgICAgICAgbnVtT2ZSb3crKztcbi8vICAgICAgICAgYXNzZXJ0KHJvdyk7XG4vLyAgICAgICAgIGFzc2VydChpZHggPj0gMCk7XG4vLyAgICAgICB9KVxuXG4vLyAgICAgICAub24oXCJkb25lXCIsIGZ1bmN0aW9uIChlcnJvcikge1xuLy8gICAgICAgICBhc3NlcnQoIWVycm9yKTtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKDIsIG51bU9mUm93KTtcbi8vICAgICAgICAgYXNzZXJ0KG51bU9mUm93ICE9PSAwKTtcbi8vICAgICAgICAgZG9uZSgpO1xuLy8gICAgICAgfSk7XG4vLyAgIH0pO1xuLy8gICBpdChcInNob3VsZCBwcm9jZXNzIGxvbmcgaGVhZGVyXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9sb25nSGVhZGVyXCI7XG4vLyAgICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSwgeyBoaWdoV2F0ZXJNYXJrOiAxMDAgfSk7XG4vLyAgICAgdmFyIG51bU9mUm93ID0gMDtcbi8vICAgICB2YXIgbnVtT2ZKc29uID0gMDtcbi8vICAgICBjc3Yoe2Zvcms6dHJ1ZX0sIHsgaGlnaFdhdGVyTWFyazogMTAwIH0pXG4vLyAgICAgICAuZnJvbVN0cmVhbShycylcbi8vICAgICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24gKHJlcywgaWR4KSB7XG4vLyAgICAgICAgIG51bU9mSnNvbisrO1xuLy8gICAgICAgICBhc3NlcnQuZXF1YWwocmVzLkRhdGUsICc4LzI2LzE2Jyk7XG4vLyAgICAgICAgIGFzc2VydChpZHggPj0gMCk7XG4vLyAgICAgICB9KVxuLy8gICAgICAgLm9uKFwiZG9uZVwiLCBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgIGFzc2VydChudW1PZkpzb24gPT09IDEpO1xuLy8gICAgICAgICBkb25lKCk7XG4vLyAgICAgICB9KTtcbi8vICAgfSk7XG4vLyAgIGl0KFwic2hvdWxkIHBhcnNlICMxMzlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YSMxMzlcIik7XG4vLyAgICAgY3N2KHtmb3JrOnRydWV9KVxuLy8gICAgICAgLmZyb21TdHJlYW0ocnMpXG4vLyAgICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4vLyAgICAgICAgIGFzc2VydC5lcXVhbChyZXNbMV0uZmllbGQzLCBcIjkwMDEwMDkzOTUgOTAwMTAwOTk5MFwiKTtcbi8vICAgICAgICAgZG9uZSgpO1xuLy8gICAgICAgfSk7XG4vLyAgIH0pO1xuXG4vLyAgIGl0KFwic2hvdWxkIGlnbm9yZSBjb2x1bW5cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbi8vICAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhRb3V0ZXNcIik7XG4vLyAgICAgdmFyIGhlYWRlckVtaXR0ZWQgPSBmYWxzZTtcbi8vICAgICBjc3Yoe1xuLy8gICAgICAgaWdub3JlQ29sdW1uczogL1RJTUVTVEFNUC8sXG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KVxuLy8gICAgICAgLmZyb21TdHJlYW0ocnMpXG4vLyAgICAgICAub24oXCJoZWFkZXJcIiwgZnVuY3Rpb24gKGhlYWRlcikge1xuLy8gICAgICAgICBhc3NlcnQuZXF1YWwoaGVhZGVyLmluZGV4T2YoXCJUSU1FU1RBTVBcIiksIC0xKTtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVVBEQVRFXCIpLCAwKTtcbi8vICAgICAgICAgaWYgKGhlYWRlckVtaXR0ZWQpIHtcbi8vICAgICAgICAgICB0aHJvdyAoXCJoZWFkZXIgZXZlbnQgc2hvdWxkIG9ubHkgaGFwcGVuIG9uY2VcIilcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBoZWFkZXJFbWl0dGVkID0gdHJ1ZTtcbi8vICAgICAgIH0pXG4vLyAgICAgICAvLyAub24oXCJjc3ZcIiwgZnVuY3Rpb24gKHJvdywgaWR4KSB7XG4vLyAgICAgICAvLyAgIGlmICghaGVhZGVyRW1pdHRlZCkge1xuLy8gICAgICAgLy8gICAgIHRocm93IChcImhlYWRlciBzaG91bGQgYmUgZW1pdHRlZCBiZWZvcmUgYW55IGRhdGEgZXZlbnRzXCIpO1xuLy8gICAgICAgLy8gICB9XG4vLyAgICAgICAvLyAgIGFzc2VydChpZHggPj0gMCk7XG4vLyAgICAgICAvLyAgIGlmIChpZHggPT09IDEpIHtcbi8vICAgICAgIC8vICAgICBhc3NlcnQuZXF1YWwocm93WzBdLCBcIm5cIik7XG4vLyAgICAgICAvLyAgIH1cbi8vICAgICAgIC8vIH0pXG4vLyAgICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChqLCBpZHgpIHtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coaik7XG4vLyAgICAgICAgIGFzc2VydCghai5USU1FU1RBTVApO1xuLy8gICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuLy8gICAgICAgfSlcbi8vICAgICAgIC5vbihcImRvbmVcIiwgZnVuY3Rpb24gKGVycikge1xuLy8gICAgICAgICBhc3NlcnQoIWVycik7XG4vLyAgICAgICAgIGFzc2VydChoZWFkZXJFbWl0dGVkKTtcbi8vICAgICAgICAgZG9uZSgpO1xuLy8gICAgICAgfSk7XG4vLyAgIH0pO1xuLy8gICBpdChcInNob3VsZCBpbmNsdWRlIGNvbHVtblwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aFFvdXRlc1wiKTtcbi8vICAgICBjc3Yoe1xuLy8gICAgICAgaW5jbHVkZUNvbHVtbnM6IC9USU1FU1RBTVAvLFxuLy8gICAgICAgZm9yazp0cnVlXG4vLyAgICAgfSlcbi8vICAgICAgIC5mcm9tU3RyZWFtKHJzKVxuLy8gICAgICAgLm9uKFwiaGVhZGVyXCIsIGZ1bmN0aW9uIChoZWFkZXIpIHtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVElNRVNUQU1QXCIpLCAwKTtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVVBEQVRFXCIpLCAtMSk7XG4vLyAgICAgICAgIGFzc2VydC5lcXVhbChoZWFkZXIubGVuZ3RoLCAxKTtcbi8vICAgICAgIH0pXG4vLyAgICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChqLCBpZHgpIHtcbi8vICAgICAgICAgYXNzZXJ0KGlkeCA+PSAwKTtcbi8vICAgICAgICAgaWYgKGlkeCA9PT0gMSkge1xuLy8gICAgICAgICAgIGFzc2VydC5lcXVhbChqLlRJTUVTVEFNUCwgXCJhYmMsIGRlZiwgY2NjXCIpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGFzc2VydCghai5VSUQpXG4vLyAgICAgICAgIGFzc2VydCghalsnQllURVMgU0VOVCddKVxuLy8gICAgICAgfSlcbi8vICAgICAgIC5vbihcImRvbmVcIiwgZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICBkb25lKCk7XG4vLyAgICAgICB9KTtcbi8vICAgfSk7XG4vLyAgIGl0KFwic2hvdWxkIGFsbG93IGhlYWRlcnMgYW5kIGluY2x1ZGUgY29sdW1ucyB0byBiZSBnaXZlbiBhcyByZWZlcmVuY2UgdG8gdGhlIHNhbWUgdmFyXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4vLyAgICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbXBsZXhKU09OQ1NWXCIpO1xuLy8gICAgIHZhciBoZWFkZXJzID0gW1xuLy8gICAgICAgJ2ZpcnN0Jyxcbi8vICAgICAgICdzZWNvbmQnLFxuLy8gICAgICAgJ3RoaXJkJyxcbi8vICAgICBdO1xuXG4vLyAgICAgdmFyIGV4cGVjdGVkID0gaGVhZGVycztcblxuLy8gICAgIGNzdih7XG4vLyAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuLy8gICAgICAgaW5jbHVkZUNvbHVtbnM6IC8oZmlyc3R8c2Vjb25kfHRoaXJkKS8sXG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KVxuLy8gICAgICAgLmZyb21TdHJlYW0ocnMpXG4vLyAgICAgICAub24oXCJoZWFkZXJcIiwgZnVuY3Rpb24gKGhlYWRlcikge1xuLy8gICAgICAgICBleHBlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbi8vICAgICAgICAgICBhc3NlcnQuZXF1YWwoaGVhZGVyLmluZGV4T2YodmFsdWUpLCBpbmRleCk7XG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfSlcbi8vICAgICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24gKGosIGlkeCkge1xuLy8gICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuLy8gICAgICAgICBhc3NlcnQuZXF1YWwoZXhwZWN0ZWQubGVuZ3RoLCBPYmplY3Qua2V5cyhqKS5sZW5ndGgpO1xuLy8gICAgICAgICBleHBlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbi8vICAgICAgICAgICBhc3NlcnQoai5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpKTtcbi8vICAgICAgICAgfSk7XG4vLyAgICAgICB9KVxuLy8gICAgICAgLm9uKFwiZG9uZVwiLCBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgIGRvbmUoKTtcbi8vICAgICAgIH0pO1xuLy8gICB9KTtcblxuLy8gICBpdChcInNob3VsZCBsZWF2ZSBwcm92aWRlZCBwYXJhbXMgb2JqZWN0cyB1bm11dGF0ZWRcIiwgZnVuY3Rpb24oKSB7XG4vLyAgICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbXBsZXhKU09OQ1NWXCIpO1xuLy8gICAgIHZhciBpbmNsdWRlQ29sdW1ucyA9IFtcbi8vICAgICAgICdmaWVsZEEudGl0bGUnLFxuLy8gICAgICAgJ2Rlc2NyaXB0aW9uJyxcbi8vICAgICBdO1xuXG5cbi8vICAgICByZXR1cm4gY3N2KHtcbi8vICAgICAgIGluY2x1ZGVDb2x1bW5zOiAvKGZpZWxkQVxcLnRpdGxlfGRlc2NyaXB0aW9uKS8sXG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KVxuLy8gICAgICAgLmZyb21TdHJlYW0ocnMpXG4vLyAgICAgICAub24oXCJqc29uXCIsIGZ1bmN0aW9uKGosIGlkeCkge1xuLy8gICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuLy8gICAgICAgfSlcbi8vICAgICAgIC5vbihcImhlYWRlclwiLCBmdW5jdGlvbihoZWFkZXIpIHtcbi8vICAgICAgICAgaW5jbHVkZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4vLyAgICAgICAgICAgYXNzZXJ0LmVxdWFsKGluZGV4LCBoZWFkZXIuaW5kZXhPZih2YWx1ZSkpO1xuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH0pXG4vLyAgIH0pO1xuLy8gICBpdChcInNob3VsZCBhY2NlcHQgcGlwZSBhcyBxdW90ZVwiLCBmdW5jdGlvbiAoZG9uZSkge1xuLy8gICAgIGNzdih7XG4vLyAgICAgICBxdW90ZTogXCJ8XCIsXG4vLyAgICAgICBvdXRwdXQ6IFwiY3N2XCIsXG4vLyAgICAgICBcImZvcmtcIjp0cnVlXG4vLyAgICAgfSlcbi8vICAgICAgIC5mcm9tRmlsZShfX2Rpcm5hbWUgKyBcIi9kYXRhL3BpcGVBc1F1b3RlXCIpXG4vLyAgICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChjc3YpIHtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKGNzdlsyXSwgXCJibGFoaGgsIGJsYWhcIik7XG4vLyAgICAgICB9KVxuLy8gICAgICAgLm9uKCdkb25lJywgZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICBkb25lKClcbi8vICAgICAgIH0pO1xuLy8gICB9KVxuLy8gICBpdChcInNob3VsZCBhbGxvdyBhc3luYyBzdWJzY3JpYmUgZnVuY3Rpb25cIiwgKCkgPT4ge1xuLy8gICAgIHJldHVybiBjc3YoeyB0cmltOiB0cnVlLGZvcms6dHJ1ZSB9KVxuLy8gICAgICAgLmZyb21TdHJpbmcoYGEsYixjXG4vLyAgICAgMSwyLDNcbi8vICAgICA0LDUsNmApXG4vLyAgICAgICAuc3Vic2NyaWJlKChkKSA9PiB7XG4vLyAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4vLyAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4vLyAgICAgICAgICAgICBkLmEgPSAxMDtcbi8vICAgICAgICAgICAgIHJlc29sdmUoKTtcbi8vICAgICAgICAgICB9LCAyMCk7XG4vLyAgICAgICAgIH0pXG4vLyAgICAgICB9KVxuLy8gICAgICAgLnRoZW4oKGQpID0+IHtcbi8vICAgICAgICAgYXNzZXJ0LmVxdWFsKGRbMF0uYSwgMTApO1xuLy8gICAgICAgICBhc3NlcnQuZXF1YWwoZFsxXS5hLCAxMCk7XG4vLyAgICAgICB9KVxuLy8gICB9KVxuLy8gICBpdChcInNob3VsZCBvbWl0IGEgY29sdW1uXCIsICgpID0+IHtcbi8vICAgICByZXR1cm4gY3N2KHtcbi8vICAgICAgIGNvbFBhcnNlcjoge1xuLy8gICAgICAgICBcImFcIjogXCJvbWl0XCJcbi8vICAgICAgIH0sXG4vLyAgICAgICBmb3JrOnRydWVcbi8vICAgICB9KVxuLy8gICAgICAgLmZyb21TdHJpbmcoYGEsYixjXG4vLyAgIDEsMiwzXG4vLyAgIGZlZmUsNSw2YClcbi8vICAgICAgIC50aGVuKChkKSA9PiB7XG4vLyAgICAgICAgIGFzc2VydC5zdHJpY3RFcXVhbChkWzBdLmEsIHVuZGVmaW5lZCk7XG4vLyAgICAgICAgIGFzc2VydC5lcXVhbChkWzFdLmEsIHVuZGVmaW5lZCk7XG4vLyAgICAgICB9KVxuLy8gICB9KVxuICBcbi8vIH0pO1xuIl19