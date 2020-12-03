"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Converter_1 = require("../src/Converter");
const src_1 = require("../src");
var assert = require("assert");
var fs = require("fs");
var sandbox = require('sinon').sandbox.create();
describe("testCSVConverter2", function () {
    afterEach(function () {
        sandbox.restore();
    });
    it("should convert from large csv string", function (done) {
        var csvStr = fs.readFileSync(__dirname + "/data/large-csv-sample.csv", "utf8");
        var conv = new Converter_1.Converter({});
        conv.fromString(csvStr).then(function (res) {
            assert(res.length === 5290);
            done();
        });
    });
    it("should set eol", function (done) {
        var rs = fs.createReadStream(__dirname + "/data/large-csv-sample.csv");
        var conv = new Converter_1.Converter({
            eol: "\n"
        });
        var count = 0;
        conv.subscribe(function (resultJson, index) {
            count++;
            assert(resultJson);
            // assert(row.length === 2);
            assert(index >= 0);
        });
        conv.on("error", function () {
            console.log(arguments);
        });
        conv.then(function (result) {
            assert(result);
            assert(count === 5290);
            done();
        });
        rs.pipe(conv);
    });
    it("should convert tsv String", function (done) {
        var tsv = __dirname + "/data/dataTsv";
        var csvStr = fs.readFileSync(tsv, "utf8");
        var conv = new Converter_1.Converter({
            delimiter: "\t",
            "checkType": false
        });
        conv.fromString(csvStr).then(function (res) {
            assert(res);
            assert.equal(res.length, 200);
            done();
        });
    });
    it("should allow customised header with nohead csv string.", function (done) {
        var testData = __dirname + "/data/noheadercsv";
        var rs = fs.readFileSync(testData, "utf8");
        var conv = new Converter_1.Converter({
            noheader: true,
            headers: ["a", "b", "c", "e", "f", "g"]
        });
        conv.fromString(rs).then(function (json) {
            assert.equal(json[0].field7, 40);
            assert.equal(json[0].a, "CC102-PDMI-001");
            done();
        });
    });
    it("should parse fromFile", function (done) {
        var csvFile = __dirname + "/data/large-csv-sample.csv";
        var conv = new Converter_1.Converter({});
        conv.fromFile(csvFile).then(function (res) {
            assert.equal(res.length, 5290);
            done();
        });
    });
    it("should fromFile should emit error", function (done) {
        var csvFile = __dirname + "/data/dataWithUnclosedQuotes";
        var conv = new Converter_1.Converter({});
        conv.fromFile(csvFile).then(function (res) {
            done();
        }, function (err) {
            assert(err);
            done();
        });
    });
    it("should parse no header with dynamic column number", function (done) {
        var testData = __dirname + "/data/noheaderWithVaryColumnNum";
        var rs = fs.readFileSync(testData, "utf8");
        var conv = new Converter_1.Converter({
            noheader: true
        });
        conv.fromString(rs).then(function (json) {
            assert.equal(json.length, 2);
            assert.equal(json[1].field4, 7);
            done();
        });
    });
    it("should parse tabsv data with dynamic columns", function (done) {
        var testData = __dirname + "/data/tabsv";
        var rs = fs.readFileSync(testData, "utf8");
        var conv = new Converter_1.Converter({
            delimiter: "\t"
        });
        conv.fromString(rs).then(function (json) {
            assert.equal(json[0].Idevise, "");
            done();
        });
    });
    it("should use first line break as eol", function (done) {
        var testData = __dirname + "/data/testEol";
        var conv = new Converter_1.Converter({
            noheader: true
        });
        conv.fromFile(testData).then(function (json) {
            assert(json);
            done();
        });
    });
    it("should detect delimiter", function (done) {
        var testData = __dirname + "/data/dataWithAutoDelimiter";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({ delimiter: "auto" });
        conv.then(function (res) {
            assert.equal(res[0].col1, "Mini. Sectt:hisar S.O");
            assert.equal(res[1].col1, "#Mini. Sectt");
            done();
        });
        rs.pipe(conv);
    });
    it("should emit delimiter event", function (done) {
        var testData = __dirname + "/data/dataWithAutoDelimiter";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({ delimiter: "auto" });
        var delimiterCallback = sandbox.spy(function (delimiter) {
            assert.equal(delimiter, ":");
        });
        conv.on("delimiter", delimiterCallback);
        conv.then(function () {
            assert.equal(delimiterCallback.callCount, 1);
            done();
        });
        rs.pipe(conv);
    });
    it("should emit delimiter event when no header", function (done) {
        var testData = __dirname + "/data/dataWithAutoDelimiter";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({ delimiter: "auto", noheader: true });
        var delimiterCallback = sandbox.spy(function (delimiter) {
            assert.equal(delimiter, ":");
        });
        conv.on("delimiter", delimiterCallback);
        conv.then(function () {
            assert.equal(delimiterCallback.callCount, 1);
            done();
        });
        rs.pipe(conv);
    });
    // it("should not emit delimiter event when delimiter is specified", function (done) {
    //   var testData = __dirname + "/data/columnArray";
    //   var rs = fs.createReadStream(testData);
    //   var conv = new Converter();
    //   conv.on("delimiter", function (delimiter) {
    //     assert.fail("delimiter event should not have been emitted");
    //   });
    //   conv.then(function () {
    //     done();
    //   });
    //   rs.pipe(conv);
    // });
    it("should stripe out whitespaces if trim is true", function (done) {
        var testData = __dirname + "/data/dataWithWhiteSpace";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({ trim: true });
        conv.then(function (res) {
            assert.equal(res[0]["Column 1"], "Column1Row1");
            assert.equal(res[0]["Column 2"], "Column2Row1");
            done();
        });
        rs.pipe(conv);
    });
    it("should convert triple quotes correctly", function (done) {
        var testData = __dirname + "/data/dataWithTripleQoutes";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({ trim: true });
        conv.then(function (res) {
            assert.equal(res[0].Description, "ac, abs, moon");
            assert.equal(res[1].Model, "Venture \"Extended Edition\"");
            assert.equal(res[2].Model, "Venture \"Extended Edition, Very Large\"");
            done();
        });
        rs.pipe(conv);
    });
    it("should pre process raw data in the line", function (done) {
        var testData = __dirname + "/data/quoteTolerant";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter();
        conv.preRawData(function (d) {
            return d.replace('THICK', 'THIN');
        });
        conv.then(function (res) {
            assert(res[0].Description.indexOf('THIN') > -1);
            done();
        });
        rs.pipe(conv);
    });
    it("should pre process by line in the line", function (done) {
        var testData = __dirname + "/data/quoteTolerant";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter();
        conv.preFileLine(function (line, lineNumber) {
            if (lineNumber === 1) {
                line = line.replace('THICK', 'THIN');
            }
            return line;
        });
        conv.then(function (res) {
            assert(res[0].Description.indexOf('THIN') > -1);
            done();
        });
        rs.pipe(conv);
    });
    it("should support object mode", function (done) {
        var testData = __dirname + "/data/complexJSONCSV";
        var rs = fs.createReadStream(testData);
        var conv = new Converter_1.Converter({}, {
            objectMode: true
        });
        conv.on("data", function (d) {
            assert(typeof d === "object");
        });
        conv.then(function (res) {
            assert(res);
            assert(res.length > 0);
            done();
        });
        rs.pipe(conv);
    });
    it("should get delimiter automatically if there is no header", function (done) {
        var test_converter = new Converter_1.Converter({
            delimiter: 'auto',
            headers: ['col1', 'col2'],
            noheader: true,
            checkColumn: true
        });
        var my_data = 'first_val\tsecond_val';
        test_converter.fromString(my_data).then(function (result) {
            assert.equal(result.length, 1);
            assert.equal(result[0].col1, "first_val");
            assert.equal(result[0].col2, "second_val");
            done();
        });
    });
    it("should process escape chars", function (done) {
        var test_converter = new Converter_1.Converter({
            escape: "\\",
            checkType: true
        });
        var testData = __dirname + "/data/dataWithSlashEscape";
        var rs = fs.createReadStream(testData);
        test_converter.then(function (res) {
            assert.equal(res[0].raw.hello, "world");
            assert.equal(res[0].raw.test, true);
            done();
        });
        rs.pipe(test_converter);
    });
    it("should process escape chars when delimiter is between escaped quotes", function (done) {
        var test_converter = new Converter_1.Converter({
            escape: "\\"
        });
        var testData = __dirname + "/data/dataWithSlashEscapeAndDelimiterBetweenQuotes";
        var rs = fs.createReadStream(testData);
        test_converter.then(function (res) {
            assert.equal(res[0].raw, '"hello,"world"');
            done();
        });
        rs.pipe(test_converter);
    });
    it("should output ndjson format", function (done) {
        var conv = new Converter_1.Converter();
        conv.fromString("a,b,c\n1,2,3\n4,5,6")
            .on("data", function (d) {
            d = d.toString();
            assert.equal(d[d.length - 1], "\n");
        })
            .on("done", done);
    });
    it("should parse from stream", function (done) {
        var testData = __dirname + "/data/complexJSONCSV";
        var rs = fs.createReadStream(testData);
        src_1.default()
            .fromStream(rs)
            .then(function (res) {
            assert(res);
            done();
        });
    });
    it("should set output as csv", function (done) {
        var testData = __dirname + "/data/complexJSONCSV";
        var rs = fs.createReadStream(testData);
        var numOfRow = 0;
        src_1.default({ output: "csv" })
            .fromStream(rs)
            .subscribe(function (row, idx) {
            numOfRow++;
            assert(row);
            assert(idx >= 0);
        })
            .on("done", function (error) {
            assert(!error);
            assert.equal(2, numOfRow);
            assert(numOfRow !== 0);
            done();
        });
    });
    it("should transform with subscribe function", function (done) {
        var testData = __dirname + "/data/complexJSONCSV";
        var rs = fs.createReadStream(testData);
        var numOfRow = 0;
        var numOfJson = 0;
        src_1.default()
            .fromStream(rs)
            .subscribe(function (json, idx) {
            json.a = "test";
            assert(idx >= 0);
        })
            .on("data", function (d) {
            const j = JSON.parse(d.toString());
            assert.equal(j.a, "test");
        })
            .on("end", function () {
            done();
        });
    });
    it("should parse a complex JSON", function (done) {
        var converter = new Converter_1.Converter({ checkType: true });
        var r = fs.createReadStream(__dirname + "/data/complexJSONCSV");
        converter.then(function (res) {
            assert(res);
            assert(res.length === 2);
            assert(res[0].fieldA.title === "Food Factory");
            assert(res[0].fieldA.children.length === 2);
            assert(res[0].fieldA.children[0].name === "Oscar");
            assert(res[0].fieldA.children[0].id === 23);
            assert(res[0].fieldA.children[1].name === "Tikka");
            assert.equal(res[0].fieldA.children[1].employee.length, 2);
            assert(res[0].fieldA.children[1].employee[0].name === "Tim", JSON.stringify(res[0].fieldA.children[1].employee[0]));
            assert(res[0].fieldA.address.length === 2);
            assert(res[0].fieldA.address[0] === "3 Lame Road");
            assert(res[0].fieldA.address[1] === "Grantstown");
            assert(res[0].description === "A fresh new food factory", res[0].description);
            done();
        });
        r.pipe(converter);
    });
    it("should allow flatKey to change parse behaviour", function (done) {
        var conv = new Converter_1.Converter({
            flatKeys: true
        });
        conv.fromString("a.b,b.d,c.a\n1,2,3\n4,5,6").subscribe(function (d) {
            assert(d["a.b"]);
            assert(d["b.d"]);
            assert(d["c.a"]);
        })
            .on("done", done);
    });
    it("should allow flat mods to change parse behaviour", function (done) {
        var conv = new Converter_1.Converter({
            colParser: {
                "a.b": {
                    flat: true
                }
            }
        });
        conv.fromString("a.b,b.d,c.a\n1,2,3\n4,5,6").subscribe(function (d) {
            assert(d["a.b"]);
        })
            .on("done", done);
    });
    it("should process long header", function (done) {
        var testData = __dirname + "/data/longHeader";
        var rs = fs.createReadStream(testData, { highWaterMark: 100 });
        var numOfRow = 0;
        var numOfJson = 0;
        src_1.default({}, { highWaterMark: 100 })
            .fromStream(rs)
            .subscribe(function (res, idx) {
            numOfJson++;
            assert.equal(res.Date, '8/26/16');
            assert(idx >= 0);
        })
            .on("done", function () {
            assert(numOfJson === 1);
            done();
        });
    });
    it("should parse #139", function (done) {
        var rs = fs.createReadStream(__dirname + "/data/data#139");
        src_1.default()
            .fromStream(rs)
            .then(function (res) {
            assert.equal(res[1].field3, "9001009395 9001009990");
            done();
        });
    });
    it("should ignore column", function (done) {
        var rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
        var headerEmitted = false;
        src_1.default({
            ignoreColumns: /TIMESTAMP/
        })
            .fromStream(rs)
            .on("header", function (header) {
            assert.equal(header.indexOf("TIMESTAMP"), -1);
            assert.equal(header.indexOf("UPDATE"), 0);
            if (headerEmitted) {
                throw ("header event should only happen once");
            }
            headerEmitted = true;
        })
            // .on("csv", function (row, idx) {
            //   if (!headerEmitted) {
            //     throw ("header should be emitted before any data events");
            //   }
            //   assert(idx >= 0);
            //   if (idx === 1) {
            //     assert.equal(row[0], "n");
            //   }
            // })
            .subscribe(function (j, idx) {
            assert(!j.TIMESTAMP);
            assert(idx >= 0);
        })
            .on("done", function () {
            assert(headerEmitted);
            done();
        });
    });
    it("should keep space around comma in csv", function () {
        const str = `"Name","Number"
    "John , space", 1234
    "Mr. , space", 4321
    `;
        return src_1.default().fromString(str)
            .then((data) => {
            assert.equal(data[0].Name, "John , space");
            assert.equal(data[1].Name, "Mr. , space");
        });
    });
    it("should include column", function (done) {
        var rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
        src_1.default({
            includeColumns: /TIMESTAMP/
        })
            .fromStream(rs)
            .on("header", function (header) {
            assert.equal(header.indexOf("TIMESTAMP"), 0);
            assert.equal(header.indexOf("UPDATE"), -1);
            assert.equal(header.length, 1);
        })
            .subscribe(function (j, idx) {
            assert(idx >= 0);
            if (idx === 1) {
                assert.equal(j.TIMESTAMP, "abc, def, ccc");
            }
            assert(!j.UID);
            assert(!j['BYTES SENT']);
        })
            .on("done", function () {
            done();
        });
    });
    it("should allow headers and include columns to be given as reference to the same var", function (done) {
        var rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
        var headers = [
            'first',
            'second',
            'third',
        ];
        var expected = headers;
        src_1.default({
            headers: headers,
            includeColumns: /(first|second|third)/,
        })
            .fromStream(rs)
            .on("header", function (header) {
            expected.forEach(function (value, index) {
                assert.equal(header.indexOf(value), index);
            });
        })
            .subscribe(function (j, idx) {
            assert(idx >= 0);
            assert.equal(expected.length, Object.keys(j).length);
            expected.forEach(function (attribute) {
                assert(j.hasOwnProperty(attribute));
            });
        })
            .on("done", function () {
            done();
        });
    });
    it("should leave provided params objects unmutated", function () {
        var rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
        var includeColumns = [
            'fieldA.title',
            'description',
        ];
        return src_1.default({
            includeColumns: /(fieldA\.title|description)/,
        })
            .fromStream(rs)
            .on("json", function (j, idx) {
            assert(idx >= 0);
        })
            .on("header", function (header) {
            includeColumns.forEach(function (value, index) {
                assert.equal(index, header.indexOf(value));
            });
        });
    });
    it("should only call done once", function (done) {
        var counter = 0;
        src_1.default()
            .fromString('"a","b", "c""')
            .on('done', function () {
            counter++;
        });
        setTimeout(function () {
            assert.equal(counter, 1);
            done();
        }, 100);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENTVkNvbnZlcnRlcjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXN0Q1NWQ29udmVydGVyMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUE2QztBQUM3QyxnQ0FBeUI7QUFDekIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtJQUM1QixTQUFTLENBQUM7UUFDUixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxJQUFJO1FBQ3ZELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQy9FLElBQUksSUFBSSxHQUFHLElBQUkscUJBQVMsQ0FBQyxFQUN4QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDNUIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsSUFBSTtRQUNqQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLDRCQUE0QixDQUFDLENBQUM7UUFDdkUsSUFBSSxJQUFJLEdBQUcsSUFBSSxxQkFBUyxDQUFDO1lBQ3ZCLEdBQUcsRUFB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TUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FB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QUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUUsVUFBVSxJQUFJO1FBQzdDLElBQUksT0FBTyxHQUFDLENBQUMsQ0FBQztRQUNkLGFBQUcsRUFBRTthQUNKLFVBQVUsQ0FBQyxlQUFlLENBQUM7YUFDM0IsRUFBRSxDQUFDLE1BQU0sRUFBQztZQUNULE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7UUFDSCxVQUFVLENBQUM7WUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUNULENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vc3JjL0NvbnZlcnRlclwiO1xuaW1wb3J0IGNzdiBmcm9tIFwiLi4vc3JjXCI7XG52YXIgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcbnZhciBzYW5kYm94ID0gcmVxdWlyZSgnc2lub24nKS5zYW5kYm94LmNyZWF0ZSgpO1xuZGVzY3JpYmUoXCJ0ZXN0Q1NWQ29udmVydGVyMlwiLCBmdW5jdGlvbiAoKSB7XG4gIGFmdGVyRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgc2FuZGJveC5yZXN0b3JlKCk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGNvbnZlcnQgZnJvbSBsYXJnZSBjc3Ygc3RyaW5nXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIGNzdlN0ciA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyBcIi9kYXRhL2xhcmdlLWNzdi1zYW1wbGUuY3N2XCIsIFwidXRmOFwiKTtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoe1xuICAgIH0pO1xuICAgIGNvbnYuZnJvbVN0cmluZyhjc3ZTdHIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0KHJlcy5sZW5ndGggPT09IDUyOTApO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdChcInNob3VsZCBzZXQgZW9sXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyBcIi9kYXRhL2xhcmdlLWNzdi1zYW1wbGUuY3N2XCIpO1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBlb2w6IFwiXFxuXCJcbiAgICB9KTtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGNvbnYuc3Vic2NyaWJlKGZ1bmN0aW9uIChyZXN1bHRKc29uLCBpbmRleCkge1xuICAgICAgY291bnQrKztcbiAgICAgIGFzc2VydChyZXN1bHRKc29uKTtcbiAgICAgIC8vIGFzc2VydChyb3cubGVuZ3RoID09PSAyKTtcbiAgICAgIGFzc2VydChpbmRleCA+PSAwKTtcbiAgICB9KTtcbiAgICBjb252Lm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgICBjb252LnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgYXNzZXJ0KHJlc3VsdCk7XG4gICAgICBhc3NlcnQoY291bnQgPT09IDUyOTApO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHJzLnBpcGUoY29udik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGNvbnZlcnQgdHN2IFN0cmluZ1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0c3YgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2RhdGFUc3ZcIjtcbiAgICB2YXIgY3N2U3RyID0gZnMucmVhZEZpbGVTeW5jKHRzdiwgXCJ1dGY4XCIpO1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBkZWxpbWl0ZXI6IFwiXFx0XCIsXG4gICAgICBcImNoZWNrVHlwZVwiOiBmYWxzZVxuICAgIH0pO1xuICAgIGNvbnYuZnJvbVN0cmluZyhjc3ZTdHIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0KHJlcyk7XG4gICAgICBhc3NlcnQuZXF1YWwocmVzLmxlbmd0aCwgMjAwKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgYWxsb3cgY3VzdG9taXNlZCBoZWFkZXIgd2l0aCBub2hlYWQgY3N2IHN0cmluZy5cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL25vaGVhZGVyY3N2XCI7XG4gICAgdmFyIHJzID0gZnMucmVhZEZpbGVTeW5jKHRlc3REYXRhLCBcInV0ZjhcIik7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHtcbiAgICAgIG5vaGVhZGVyOiB0cnVlLFxuICAgICAgaGVhZGVyczogW1wiYVwiLCBcImJcIiwgXCJjXCIsIFwiZVwiLCBcImZcIiwgXCJnXCJdXG4gICAgfSk7XG4gICAgY29udi5mcm9tU3RyaW5nKHJzKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvblswXS5maWVsZDcsIDQwKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uWzBdLmEsIFwiQ0MxMDItUERNSS0wMDFcIik7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHBhcnNlIGZyb21GaWxlXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIGNzdkZpbGUgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2xhcmdlLWNzdi1zYW1wbGUuY3N2XCI7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHtcbiAgICB9KTtcbiAgICBjb252LmZyb21GaWxlKGNzdkZpbGUpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlcy5sZW5ndGgsIDUyOTApO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdChcInNob3VsZCBmcm9tRmlsZSBzaG91bGQgZW1pdCBlcnJvclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBjc3ZGaWxlID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aFVuY2xvc2VkUXVvdGVzXCI7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHtcbiAgICB9KTtcbiAgICBjb252LmZyb21GaWxlKGNzdkZpbGUpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXG4gICAgICBkb25lKCk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgYXNzZXJ0KGVycik7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHBhcnNlIG5vIGhlYWRlciB3aXRoIGR5bmFtaWMgY29sdW1uIG51bWJlclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvbm9oZWFkZXJXaXRoVmFyeUNvbHVtbk51bVwiO1xuICAgIHZhciBycyA9IGZzLnJlYWRGaWxlU3luYyh0ZXN0RGF0YSwgXCJ1dGY4XCIpO1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBub2hlYWRlcjogdHJ1ZVxuICAgIH0pO1xuICAgIGNvbnYuZnJvbVN0cmluZyhycykudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb24ubGVuZ3RoLCAyKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uWzFdLmZpZWxkNCwgNyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHBhcnNlIHRhYnN2IGRhdGEgd2l0aCBkeW5hbWljIGNvbHVtbnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3RhYnN2XCI7XG4gICAgdmFyIHJzID0gZnMucmVhZEZpbGVTeW5jKHRlc3REYXRhLCBcInV0ZjhcIik7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHtcbiAgICAgIGRlbGltaXRlcjogXCJcXHRcIlxuICAgIH0pO1xuICAgIGNvbnYuZnJvbVN0cmluZyhycykudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25bMF0uSWRldmlzZSwgXCJcIik7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHVzZSBmaXJzdCBsaW5lIGJyZWFrIGFzIGVvbFwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvdGVzdEVvbFwiO1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBub2hlYWRlcjogdHJ1ZVxuICAgIH0pO1xuICAgIGNvbnYuZnJvbUZpbGUodGVzdERhdGEpLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgIGFzc2VydChqc29uKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cblxuICBpdChcInNob3VsZCBkZXRlY3QgZGVsaW1pdGVyXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aEF1dG9EZWxpbWl0ZXJcIjtcbiAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoeyBkZWxpbWl0ZXI6IFwiYXV0b1wiIH0pO1xuICAgIGNvbnYudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBhc3NlcnQuZXF1YWwocmVzWzBdLmNvbDEsIFwiTWluaS4gU2VjdHQ6aGlzYXIgUy5PXCIpO1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1sxXS5jb2wxLCBcIiNNaW5pLiBTZWN0dFwiKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgICBycy5waXBlKGNvbnYpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBlbWl0IGRlbGltaXRlciBldmVudFwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhBdXRvRGVsaW1pdGVyXCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHsgZGVsaW1pdGVyOiBcImF1dG9cIiB9KTtcbiAgICB2YXIgZGVsaW1pdGVyQ2FsbGJhY2sgPSBzYW5kYm94LnNweShmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gICAgICBhc3NlcnQuZXF1YWwoZGVsaW1pdGVyLCBcIjpcIik7XG4gICAgfSk7XG4gICAgY29udi5vbihcImRlbGltaXRlclwiLCBkZWxpbWl0ZXJDYWxsYmFjayk7XG4gICAgY29udi50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFzc2VydC5lcXVhbChkZWxpbWl0ZXJDYWxsYmFjay5jYWxsQ291bnQsIDEpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHJzLnBpcGUoY29udik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGVtaXQgZGVsaW1pdGVyIGV2ZW50IHdoZW4gbm8gaGVhZGVyXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aEF1dG9EZWxpbWl0ZXJcIjtcbiAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoeyBkZWxpbWl0ZXI6IFwiYXV0b1wiLCBub2hlYWRlcjogdHJ1ZSB9KTtcbiAgICB2YXIgZGVsaW1pdGVyQ2FsbGJhY2sgPSBzYW5kYm94LnNweShmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gICAgICBhc3NlcnQuZXF1YWwoZGVsaW1pdGVyLCBcIjpcIik7XG4gICAgfSk7XG4gICAgY29udi5vbihcImRlbGltaXRlclwiLCBkZWxpbWl0ZXJDYWxsYmFjayk7XG4gICAgY29udi50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFzc2VydC5lcXVhbChkZWxpbWl0ZXJDYWxsYmFjay5jYWxsQ291bnQsIDEpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHJzLnBpcGUoY29udik7XG4gIH0pO1xuXG4gIC8vIGl0KFwic2hvdWxkIG5vdCBlbWl0IGRlbGltaXRlciBldmVudCB3aGVuIGRlbGltaXRlciBpcyBzcGVjaWZpZWRcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgLy8gICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbHVtbkFycmF5XCI7XG4gIC8vICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gIC8vICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKCk7XG4gIC8vICAgY29udi5vbihcImRlbGltaXRlclwiLCBmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gIC8vICAgICBhc3NlcnQuZmFpbChcImRlbGltaXRlciBldmVudCBzaG91bGQgbm90IGhhdmUgYmVlbiBlbWl0dGVkXCIpO1xuICAvLyAgIH0pO1xuICAvLyAgIGNvbnYudGhlbihmdW5jdGlvbiAoKSB7XG4gIC8vICAgICBkb25lKCk7XG4gIC8vICAgfSk7XG5cbiAgLy8gICBycy5waXBlKGNvbnYpO1xuICAvLyB9KTtcblxuICBpdChcInNob3VsZCBzdHJpcGUgb3V0IHdoaXRlc3BhY2VzIGlmIHRyaW0gaXMgdHJ1ZVwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhXaGl0ZVNwYWNlXCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHsgdHJpbTogdHJ1ZSB9KTtcbiAgICBjb252LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1swXVtcIkNvbHVtbiAxXCJdLCBcIkNvbHVtbjFSb3cxXCIpO1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1swXVtcIkNvbHVtbiAyXCJdLCBcIkNvbHVtbjJSb3cxXCIpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHJzLnBpcGUoY29udik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGNvbnZlcnQgdHJpcGxlIHF1b3RlcyBjb3JyZWN0bHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2RhdGFXaXRoVHJpcGxlUW91dGVzXCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKHsgdHJpbTogdHJ1ZSB9KTtcbiAgICBjb252LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1swXS5EZXNjcmlwdGlvbiwgXCJhYywgYWJzLCBtb29uXCIpO1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1sxXS5Nb2RlbCwgXCJWZW50dXJlIFxcXCJFeHRlbmRlZCBFZGl0aW9uXFxcIlwiKTtcbiAgICAgIGFzc2VydC5lcXVhbChyZXNbMl0uTW9kZWwsIFwiVmVudHVyZSBcXFwiRXh0ZW5kZWQgRWRpdGlvbiwgVmVyeSBMYXJnZVxcXCJcIik7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgcnMucGlwZShjb252KTtcbiAgfSk7XG5cblxuXG4gIGl0KFwic2hvdWxkIHByZSBwcm9jZXNzIHJhdyBkYXRhIGluIHRoZSBsaW5lXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9xdW90ZVRvbGVyYW50XCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgdmFyIGNvbnYgPSBuZXcgQ29udmVydGVyKCk7XG4gICAgY29udi5wcmVSYXdEYXRhKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gZC5yZXBsYWNlKCdUSElDSycsICdUSElOJyk7XG4gICAgfSk7XG4gICAgY29udi50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGFzc2VydChyZXNbMF0uRGVzY3JpcHRpb24uaW5kZXhPZignVEhJTicpID4gLTEpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHJzLnBpcGUoY29udik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHByZSBwcm9jZXNzIGJ5IGxpbmUgaW4gdGhlIGxpbmVcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL3F1b3RlVG9sZXJhbnRcIjtcbiAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlc3REYXRhKTtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoKTtcbiAgICBjb252LnByZUZpbGVMaW5lKGZ1bmN0aW9uIChsaW5lLCBsaW5lTnVtYmVyKSB7XG4gICAgICBpZiAobGluZU51bWJlciA9PT0gMSkge1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKCdUSElDSycsICdUSElOJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9KTtcblxuICAgIGNvbnYudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBhc3NlcnQocmVzWzBdLkRlc2NyaXB0aW9uLmluZGV4T2YoJ1RISU4nKSA+IC0xKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgICBycy5waXBlKGNvbnYpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBzdXBwb3J0IG9iamVjdCBtb2RlXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9jb21wbGV4SlNPTkNTVlwiO1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7fSwge1xuICAgICAgb2JqZWN0TW9kZTogdHJ1ZVxuICAgIH0pO1xuICAgIGNvbnYub24oXCJkYXRhXCIsIGZ1bmN0aW9uIChkKSB7XG4gICAgICBhc3NlcnQodHlwZW9mIGQgPT09IFwib2JqZWN0XCIpO1xuICAgIH0pO1xuICAgIGNvbnYudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBhc3NlcnQocmVzKTtcbiAgICAgIGFzc2VydChyZXMubGVuZ3RoID4gMCk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgcnMucGlwZShjb252KTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgZ2V0IGRlbGltaXRlciBhdXRvbWF0aWNhbGx5IGlmIHRoZXJlIGlzIG5vIGhlYWRlclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0X2NvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIoe1xuICAgICAgZGVsaW1pdGVyOiAnYXV0bycsXG4gICAgICBoZWFkZXJzOiBbJ2NvbDEnLCAnY29sMiddLFxuICAgICAgbm9oZWFkZXI6IHRydWUsXG4gICAgICBjaGVja0NvbHVtbjogdHJ1ZVxuICAgIH0pO1xuXG4gICAgdmFyIG15X2RhdGEgPSAnZmlyc3RfdmFsXFx0c2Vjb25kX3ZhbCc7XG4gICAgdGVzdF9jb252ZXJ0ZXIuZnJvbVN0cmluZyhteV9kYXRhKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQubGVuZ3RoLCAxKTtcbiAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbMF0uY29sMSwgXCJmaXJzdF92YWxcIik7XG4gICAgICBhc3NlcnQuZXF1YWwocmVzdWx0WzBdLmNvbDIsIFwic2Vjb25kX3ZhbFwiKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgcHJvY2VzcyBlc2NhcGUgY2hhcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdF9jb252ZXJ0ZXIgPSBuZXcgQ29udmVydGVyKHtcbiAgICAgIGVzY2FwZTogXCJcXFxcXCIsXG4gICAgICBjaGVja1R5cGU6IHRydWVcbiAgICB9KTtcblxuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YVdpdGhTbGFzaEVzY2FwZVwiO1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuICAgIHRlc3RfY29udmVydGVyLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1swXS5yYXcuaGVsbG8sIFwid29ybGRcIik7XG4gICAgICBhc3NlcnQuZXF1YWwocmVzWzBdLnJhdy50ZXN0LCB0cnVlKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgICBycy5waXBlKHRlc3RfY29udmVydGVyKTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgcHJvY2VzcyBlc2NhcGUgY2hhcnMgd2hlbiBkZWxpbWl0ZXIgaXMgYmV0d2VlbiBlc2NhcGVkIHF1b3Rlc1wiLCBmdW5jdGlvbihkb25lKSB7XG4gICAgdmFyIHRlc3RfY29udmVydGVyID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBlc2NhcGU6IFwiXFxcXFwiXG4gICAgfSk7XG5cbiAgICB2YXIgdGVzdERhdGEgPVxuICAgICAgX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aFNsYXNoRXNjYXBlQW5kRGVsaW1pdGVyQmV0d2VlblF1b3Rlc1wiO1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuICAgIHRlc3RfY29udmVydGVyLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBhc3NlcnQuZXF1YWwocmVzWzBdLnJhdywgJ1wiaGVsbG8sXCJ3b3JsZFwiJyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgcnMucGlwZSh0ZXN0X2NvbnZlcnRlcik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIG91dHB1dCBuZGpzb24gZm9ybWF0XCIsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoKTtcbiAgICBjb252LmZyb21TdHJpbmcoXCJhLGIsY1xcbjEsMiwzXFxuNCw1LDZcIilcbiAgICAgIC5vbihcImRhdGFcIiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgZCA9IGQudG9TdHJpbmcoKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGRbZC5sZW5ndGggLSAxXSwgXCJcXG5cIik7XG4gICAgICB9KVxuICAgICAgLm9uKFwiZG9uZVwiLCBkb25lKTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgcGFyc2UgZnJvbSBzdHJlYW1cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbXBsZXhKU09OQ1NWXCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgY3N2KClcbiAgICAgIC5mcm9tU3RyZWFtKHJzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBhc3NlcnQocmVzKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHNldCBvdXRwdXQgYXMgY3N2XCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3REYXRhID0gX19kaXJuYW1lICsgXCIvZGF0YS9jb21wbGV4SlNPTkNTVlwiO1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEpO1xuICAgIHZhciBudW1PZlJvdyA9IDA7XG4gICAgY3N2KHsgb3V0cHV0OiBcImNzdlwiIH0pXG4gICAgICAuZnJvbVN0cmVhbShycylcbiAgICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24gKHJvdywgaWR4KSB7XG4gICAgICAgIG51bU9mUm93Kys7XG4gICAgICAgIGFzc2VydChyb3cpO1xuICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuICAgICAgfSlcblxuICAgICAgLm9uKFwiZG9uZVwiLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgYXNzZXJ0KCFlcnJvcik7XG4gICAgICAgIGFzc2VydC5lcXVhbCgyLCBudW1PZlJvdyk7XG4gICAgICAgIGFzc2VydChudW1PZlJvdyAhPT0gMCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdChcInNob3VsZCB0cmFuc2Zvcm0gd2l0aCBzdWJzY3JpYmUgZnVuY3Rpb25cIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdERhdGEgPSBfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbXBsZXhKU09OQ1NWXCI7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0ZXN0RGF0YSk7XG4gICAgdmFyIG51bU9mUm93ID0gMDtcbiAgICB2YXIgbnVtT2ZKc29uID0gMDtcbiAgICBjc3YoKVxuICAgICAgLmZyb21TdHJlYW0ocnMpXG4gICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChqc29uLCBpZHgpIHtcbiAgICAgICAganNvbi5hID0gXCJ0ZXN0XCI7XG4gICAgICAgIGFzc2VydChpZHggPj0gMCk7XG4gICAgICB9KVxuICAgICAgLm9uKFwiZGF0YVwiLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICBjb25zdCBqID0gSlNPTi5wYXJzZShkLnRvU3RyaW5nKCkpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoai5hLCBcInRlc3RcIik7XG4gICAgICB9KVxuICAgICAgLm9uKFwiZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHBhcnNlIGEgY29tcGxleCBKU09OXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIGNvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIoeyBjaGVja1R5cGU6IHRydWUgfSk7XG4gICAgdmFyIHIgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArIFwiL2RhdGEvY29tcGxleEpTT05DU1ZcIik7XG4gICAgY29udmVydGVyLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgYXNzZXJ0KHJlcyk7XG4gICAgICBhc3NlcnQocmVzLmxlbmd0aCA9PT0gMik7XG4gICAgICBhc3NlcnQocmVzWzBdLmZpZWxkQS50aXRsZSA9PT0gXCJGb29kIEZhY3RvcnlcIik7XG4gICAgICBhc3NlcnQocmVzWzBdLmZpZWxkQS5jaGlsZHJlbi5sZW5ndGggPT09IDIpO1xuICAgICAgYXNzZXJ0KHJlc1swXS5maWVsZEEuY2hpbGRyZW5bMF0ubmFtZSA9PT0gXCJPc2NhclwiKTtcbiAgICAgIGFzc2VydChyZXNbMF0uZmllbGRBLmNoaWxkcmVuWzBdLmlkID09PSAyMyk7XG4gICAgICBhc3NlcnQocmVzWzBdLmZpZWxkQS5jaGlsZHJlblsxXS5uYW1lID09PSBcIlRpa2thXCIpO1xuICAgICAgYXNzZXJ0LmVxdWFsKHJlc1swXS5maWVsZEEuY2hpbGRyZW5bMV0uZW1wbG95ZWUubGVuZ3RoLCAyKTtcbiAgICAgIGFzc2VydChyZXNbMF0uZmllbGRBLmNoaWxkcmVuWzFdLmVtcGxveWVlWzBdLm5hbWUgPT09IFwiVGltXCIsIEpTT04uc3RyaW5naWZ5KHJlc1swXS5maWVsZEEuY2hpbGRyZW5bMV0uZW1wbG95ZWVbMF0pKTtcbiAgICAgIGFzc2VydChyZXNbMF0uZmllbGRBLmFkZHJlc3MubGVuZ3RoID09PSAyKTtcbiAgICAgIGFzc2VydChyZXNbMF0uZmllbGRBLmFkZHJlc3NbMF0gPT09IFwiMyBMYW1lIFJvYWRcIik7XG4gICAgICBhc3NlcnQocmVzWzBdLmZpZWxkQS5hZGRyZXNzWzFdID09PSBcIkdyYW50c3Rvd25cIik7XG4gICAgICBhc3NlcnQocmVzWzBdLmRlc2NyaXB0aW9uID09PSBcIkEgZnJlc2ggbmV3IGZvb2QgZmFjdG9yeVwiLCByZXNbMF0uZGVzY3JpcHRpb24pO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICAgIHIucGlwZShjb252ZXJ0ZXIpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBhbGxvdyBmbGF0S2V5IHRvIGNoYW5nZSBwYXJzZSBiZWhhdmlvdXJcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgY29udiA9IG5ldyBDb252ZXJ0ZXIoe1xuICAgICAgZmxhdEtleXM6IHRydWVcbiAgICB9KTtcbiAgICBjb252LmZyb21TdHJpbmcoXCJhLmIsYi5kLGMuYVxcbjEsMiwzXFxuNCw1LDZcIikuc3Vic2NyaWJlKGZ1bmN0aW9uIChkKSB7XG4gICAgICBhc3NlcnQoZFtcImEuYlwiXSk7XG4gICAgICBhc3NlcnQoZFtcImIuZFwiXSk7XG4gICAgICBhc3NlcnQoZFtcImMuYVwiXSk7XG4gICAgfSlcbiAgICAgIC5vbihcImRvbmVcIiwgZG9uZSk7XG4gIH0pO1xuICBpdChcInNob3VsZCBhbGxvdyBmbGF0IG1vZHMgdG8gY2hhbmdlIHBhcnNlIGJlaGF2aW91clwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBjb252ID0gbmV3IENvbnZlcnRlcih7XG4gICAgICBjb2xQYXJzZXI6IHtcbiAgICAgICAgXCJhLmJcIjoge1xuICAgICAgICAgIGZsYXQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnYuZnJvbVN0cmluZyhcImEuYixiLmQsYy5hXFxuMSwyLDNcXG40LDUsNlwiKS5zdWJzY3JpYmUoZnVuY3Rpb24gKGQpIHtcbiAgICAgIGFzc2VydChkW1wiYS5iXCJdKTtcbiAgICB9KVxuICAgICAgLm9uKFwiZG9uZVwiLCBkb25lKTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgcHJvY2VzcyBsb25nIGhlYWRlclwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0RGF0YSA9IF9fZGlybmFtZSArIFwiL2RhdGEvbG9uZ0hlYWRlclwiO1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVzdERhdGEsIHsgaGlnaFdhdGVyTWFyazogMTAwIH0pO1xuICAgIHZhciBudW1PZlJvdyA9IDA7XG4gICAgdmFyIG51bU9mSnNvbiA9IDA7XG4gICAgY3N2KHt9LCB7IGhpZ2hXYXRlck1hcms6IDEwMCB9KVxuICAgICAgLmZyb21TdHJlYW0ocnMpXG4gICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChyZXMsIGlkeCkge1xuICAgICAgICBudW1PZkpzb24rKztcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHJlcy5EYXRlLCAnOC8yNi8xNicpO1xuICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuICAgICAgfSlcbiAgICAgIC5vbihcImRvbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhc3NlcnQobnVtT2ZKc29uID09PSAxKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHBhcnNlICMxMzlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArIFwiL2RhdGEvZGF0YSMxMzlcIik7XG4gICAgY3N2KClcbiAgICAgIC5mcm9tU3RyZWFtKHJzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBhc3NlcnQuZXF1YWwocmVzWzFdLmZpZWxkMywgXCI5MDAxMDA5Mzk1IDkwMDEwMDk5OTBcIik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdChcInNob3VsZCBpZ25vcmUgY29sdW1uXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyBcIi9kYXRhL2RhdGFXaXRoUW91dGVzXCIpO1xuICAgIHZhciBoZWFkZXJFbWl0dGVkID0gZmFsc2U7XG4gICAgY3N2KHtcbiAgICAgIGlnbm9yZUNvbHVtbnM6IC9USU1FU1RBTVAvXG4gICAgfSlcbiAgICAgIC5mcm9tU3RyZWFtKHJzKVxuICAgICAgLm9uKFwiaGVhZGVyXCIsIGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVElNRVNUQU1QXCIpLCAtMSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChoZWFkZXIuaW5kZXhPZihcIlVQREFURVwiKSwgMCk7XG4gICAgICAgIGlmIChoZWFkZXJFbWl0dGVkKSB7XG4gICAgICAgICAgdGhyb3cgKFwiaGVhZGVyIGV2ZW50IHNob3VsZCBvbmx5IGhhcHBlbiBvbmNlXCIpXG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVyRW1pdHRlZCA9IHRydWU7XG4gICAgICB9KVxuICAgICAgLy8gLm9uKFwiY3N2XCIsIGZ1bmN0aW9uIChyb3csIGlkeCkge1xuICAgICAgLy8gICBpZiAoIWhlYWRlckVtaXR0ZWQpIHtcbiAgICAgIC8vICAgICB0aHJvdyAoXCJoZWFkZXIgc2hvdWxkIGJlIGVtaXR0ZWQgYmVmb3JlIGFueSBkYXRhIGV2ZW50c1wiKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gICBhc3NlcnQoaWR4ID49IDApO1xuICAgICAgLy8gICBpZiAoaWR4ID09PSAxKSB7XG4gICAgICAvLyAgICAgYXNzZXJ0LmVxdWFsKHJvd1swXSwgXCJuXCIpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KVxuICAgICAgLnN1YnNjcmliZShmdW5jdGlvbiAoaiwgaWR4KSB7XG4gICAgICAgIGFzc2VydCghai5USU1FU1RBTVApO1xuICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuICAgICAgfSlcbiAgICAgIC5vbihcImRvbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhc3NlcnQoaGVhZGVyRW1pdHRlZCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcbiAgaXQoXCJzaG91bGQga2VlcCBzcGFjZSBhcm91bmQgY29tbWEgaW4gY3N2XCIsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzdHIgPSBgXCJOYW1lXCIsXCJOdW1iZXJcIlxuICAgIFwiSm9obiAsIHNwYWNlXCIsIDEyMzRcbiAgICBcIk1yLiAsIHNwYWNlXCIsIDQzMjFcbiAgICBgO1xuICAgIHJldHVybiBjc3YoKS5mcm9tU3RyaW5nKHN0cilcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGFzc2VydC5lcXVhbChkYXRhWzBdLk5hbWUsIFwiSm9obiAsIHNwYWNlXCIpO1xuICAgICAgICBhc3NlcnQuZXF1YWwoZGF0YVsxXS5OYW1lLCBcIk1yLiAsIHNwYWNlXCIpO1xuICAgICAgfSlcbiAgfSlcblxuICBpdChcInNob3VsZCBpbmNsdWRlIGNvbHVtblwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oX19kaXJuYW1lICsgXCIvZGF0YS9kYXRhV2l0aFFvdXRlc1wiKTtcbiAgICBjc3Yoe1xuICAgICAgaW5jbHVkZUNvbHVtbnM6IC9USU1FU1RBTVAvXG4gICAgfSlcbiAgICAgIC5mcm9tU3RyZWFtKHJzKVxuICAgICAgLm9uKFwiaGVhZGVyXCIsIGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVElNRVNUQU1QXCIpLCAwKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKGhlYWRlci5pbmRleE9mKFwiVVBEQVRFXCIpLCAtMSk7XG4gICAgICAgIGFzc2VydC5lcXVhbChoZWFkZXIubGVuZ3RoLCAxKTtcbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uIChqLCBpZHgpIHtcbiAgICAgICAgYXNzZXJ0KGlkeCA+PSAwKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gMSkge1xuICAgICAgICAgIGFzc2VydC5lcXVhbChqLlRJTUVTVEFNUCwgXCJhYmMsIGRlZiwgY2NjXCIpO1xuICAgICAgICB9XG4gICAgICAgIGFzc2VydCghai5VSUQpXG4gICAgICAgIGFzc2VydCghalsnQllURVMgU0VOVCddKVxuICAgICAgfSlcbiAgICAgIC5vbihcImRvbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgYWxsb3cgaGVhZGVycyBhbmQgaW5jbHVkZSBjb2x1bW5zIHRvIGJlIGdpdmVuIGFzIHJlZmVyZW5jZSB0byB0aGUgc2FtZSB2YXJcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgcnMgPSBmcy5jcmVhdGVSZWFkU3RyZWFtKF9fZGlybmFtZSArIFwiL2RhdGEvY29tcGxleEpTT05DU1ZcIik7XG4gICAgdmFyIGhlYWRlcnMgPSBbXG4gICAgICAnZmlyc3QnLFxuICAgICAgJ3NlY29uZCcsXG4gICAgICAndGhpcmQnLFxuICAgIF07XG5cbiAgICB2YXIgZXhwZWN0ZWQgPSBoZWFkZXJzO1xuXG4gICAgY3N2KHtcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICBpbmNsdWRlQ29sdW1uczogLyhmaXJzdHxzZWNvbmR8dGhpcmQpLyxcbiAgICB9KVxuICAgICAgLmZyb21TdHJlYW0ocnMpXG4gICAgICAub24oXCJoZWFkZXJcIiwgZnVuY3Rpb24gKGhlYWRlcikge1xuICAgICAgICBleHBlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICBhc3NlcnQuZXF1YWwoaGVhZGVyLmluZGV4T2YodmFsdWUpLCBpbmRleCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24gKGosIGlkeCkge1xuICAgICAgICBhc3NlcnQoaWR4ID49IDApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoZXhwZWN0ZWQubGVuZ3RoLCBPYmplY3Qua2V5cyhqKS5sZW5ndGgpO1xuICAgICAgICBleHBlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICBhc3NlcnQoai5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLm9uKFwiZG9uZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdChcInNob3VsZCBsZWF2ZSBwcm92aWRlZCBwYXJhbXMgb2JqZWN0cyB1bm11dGF0ZWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJzID0gZnMuY3JlYXRlUmVhZFN0cmVhbShfX2Rpcm5hbWUgKyBcIi9kYXRhL2NvbXBsZXhKU09OQ1NWXCIpO1xuICAgIHZhciBpbmNsdWRlQ29sdW1ucyA9IFtcbiAgICAgICdmaWVsZEEudGl0bGUnLFxuICAgICAgJ2Rlc2NyaXB0aW9uJyxcbiAgICBdO1xuXG5cbiAgICByZXR1cm4gY3N2KHtcbiAgICAgIGluY2x1ZGVDb2x1bW5zOiAvKGZpZWxkQVxcLnRpdGxlfGRlc2NyaXB0aW9uKS8sXG4gICAgfSlcbiAgICAgIC5mcm9tU3RyZWFtKHJzKVxuICAgICAgLm9uKFwianNvblwiLCBmdW5jdGlvbihqLCBpZHgpIHtcbiAgICAgICAgYXNzZXJ0KGlkeCA+PSAwKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJoZWFkZXJcIiwgZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIGluY2x1ZGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIGFzc2VydC5lcXVhbChpbmRleCwgaGVhZGVyLmluZGV4T2YodmFsdWUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICB9KTtcblxuICBpdChcInNob3VsZCBvbmx5IGNhbGwgZG9uZSBvbmNlXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIGNvdW50ZXI9MDtcbiAgICBjc3YoKVxuICAgIC5mcm9tU3RyaW5nKCdcImFcIixcImJcIiwgXCJjXCJcIicpXG4gICAgLm9uKCdkb25lJyxmdW5jdGlvbigpe1xuICAgICAgY291bnRlcisrO1xuICAgIH0pO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGFzc2VydC5lcXVhbChjb3VudGVyLDEpO1xuICAgICAgZG9uZSgpO1xuICAgIH0sMTAwKTtcbiAgfSlcbn0pO1xuIl19