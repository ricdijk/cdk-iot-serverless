"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rowSplit_1 = require("./rowSplit");
const Converter_1 = require("./Converter");
const assert = require("assert");
describe("Test delimiters", function () {
    const getDelimiter = (str, opt) => {
        return rowSplit_1.RowSplit.prototype["getDelimiter"].call({
            conv: {
                parseParam: {
                    delimiter: opt.delimiter
                }
            }
        }, str);
    };
    it("should return the explicitly specified delimiter", function () {
        var delimiter = ";";
        var rowStr = "a;b;c";
        var returnedDelimiter = getDelimiter(rowStr, { delimiter: ";" });
        assert.equal(returnedDelimiter, delimiter);
    });
    it("should return the autodetected delimiter if 'auto' specified", function () {
        var rowStr = "a;b;c";
        var returnedDelimiter = getDelimiter(rowStr, { delimiter: "auto" });
        assert(returnedDelimiter === ";");
    });
    it("should return the ',' delimiter if delimiter cannot be specified, in case of 'auto'", function () {
        var rowStr = "abc";
        var returnedDelimiter = getDelimiter(rowStr, { delimiter: "auto" });
        assert(returnedDelimiter === ",");
    });
    it("should accetp an array with potential delimiters", function () {
        var rowStr = "a$b$c";
        var returnedDelimiter = getDelimiter(rowStr, { delimiter: [",", ";", "$"] });
        assert(returnedDelimiter === '$');
    });
});
describe("ParseMultiLine function", function () {
    const rowSplit = new rowSplit_1.RowSplit(new Converter_1.Converter());
    const func = (lines) => {
        return rowSplit.parseMultiLines(lines);
    };
    it("should convert lines to csv lines", function () {
        var lines = [
            "a,b,c,d",
            "hello,world,csvtojson,abc",
            "1,2,3,4"
        ];
        var res = func(lines);
        assert.equal(res.rowsCells.length, 3);
        assert.equal(res.partial, "");
    });
    it("should process line breaks", function () {
        var lines = [
            "a,b,c",
            '15",hello,"ab',
            "cde\"",
            "\"b\"\"b\",cc,dd"
        ];
        var res = func(lines);
        assert.equal(res.rowsCells.length, 3);
        assert.equal(res.rowsCells[1][0], "15\"");
        assert.equal(res.rowsCells[1][2], "ab\ncde");
        assert.equal(res.rowsCells[2][0], "b\"b");
        assert.equal(res.partial, "");
    });
    it("should return partial if line not closed", function () {
        var lines = [
            "a,b,c",
            '15",hello,"ab',
            "d,e,f"
        ];
        var res = func(lines);
        assert.equal(res.rowsCells.length, 1);
        assert.equal(res.partial, "15\",hello,\"ab\nd,e,f\n");
    });
});
describe("RowSplit.parse function", function () {
    const rowSplit = new rowSplit_1.RowSplit(new Converter_1.Converter());
    const func = (str) => {
        return rowSplit.parse(str);
    };
    it("should split complete csv line", function () {
        var str = "hello,world,csvtojson,awesome";
        var res = func(str);
        assert.equal(res.cells.length, 4);
        assert.equal(res.closed, true);
    });
    it("should split incomplete csv line", function () {
        var str = "hello,world,\"csvtojson,awesome";
        var res = func(str);
        assert.equal(res.closed, false);
    });
    it("should allow multiple line", function () {
        var str = "\"he\"llo\",world,\"csvtojson,a\"\nwesome\"";
        var res = func(str);
        assert.equal(res.closed, true);
        assert.equal(res.cells[2], 'csvtojson,a"\nwesome');
    });
    it("should allow blank quotes", () => {
        const data = "a|^^|^b^";
        const rowSplit = new rowSplit_1.RowSplit(new Converter_1.Converter({
            delimiter: '|',
            quote: '^',
            noheader: true
        }));
        const res = rowSplit.parse(data);
        assert.equal(res.cells[1], "");
    });
    it("should allow blank quotes in quotes", () => {
        const data = 'a,"hello,this,"", test"';
        const rowSplit = new rowSplit_1.RowSplit(new Converter_1.Converter({
            noheader: true
        }));
        const res = rowSplit.parse(data);
        assert.equal(res.cells[1], 'hello,this,", test');
    });
    it("should smart detect if an initial quote is only part of value ", () => {
        const data = '"Weight" (kg),Error code,"Height" (m)';
        const rowSplit = new rowSplit_1.RowSplit(new Converter_1.Converter({
            noheader: true
        }));
        const res = rowSplit.parse(data);
        assert.equal(res.cells.length, 3);
        assert(res.closed);
        assert.equal(res.cells[0], '"Weight" (kg)');
        assert.equal(res.cells[1], 'Error code');
        assert.equal(res.cells[2], '"Height" (m)');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93U3BsaXQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJvd1NwbGl0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBeUU7QUFDekUsMkNBQXdDO0FBQ3hDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7SUFDMUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBcUMsRUFBVSxFQUFFO1FBQzFFLE9BQU8sbUJBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdDLElBQUksRUFBRTtnQkFDSixVQUFVLEVBQUU7b0JBQ1YsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO2lCQUN6QjthQUNGO1NBQ0YsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNWLENBQUMsQ0FBQTtJQUVELEVBQUUsQ0FBQyxrREFBa0QsRUFBRTtRQUNyRCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDcEIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ3JCLElBQUksaUJBQWlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOERBQThELEVBQUU7UUFDakUsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ3JCLElBQUksaUJBQWlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxpQkFBaUIsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxRkFBcUYsRUFB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QyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsZUFBZSxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBQyxjQUFjLENBQUMsQ0FBQztJQUU1QyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm93U3BsaXQsIE11bHRpcGxlUm93UmVzdWx0LCBSb3dTcGxpdFJlc3VsdCB9IGZyb20gXCIuL3Jvd1NwbGl0XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi9Db252ZXJ0ZXJcIjtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5cbmRlc2NyaWJlKFwiVGVzdCBkZWxpbWl0ZXJzXCIsIGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZ2V0RGVsaW1pdGVyID0gKHN0ciwgb3B0OiB7IGRlbGltaXRlcjogc3RyaW5nIHwgc3RyaW5nW10gfSk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIFJvd1NwbGl0LnByb3RvdHlwZVtcImdldERlbGltaXRlclwiXS5jYWxsKHtcbiAgICAgIGNvbnY6IHtcbiAgICAgICAgcGFyc2VQYXJhbToge1xuICAgICAgICAgIGRlbGltaXRlcjogb3B0LmRlbGltaXRlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgc3RyKTtcbiAgfVxuXG4gIGl0KFwic2hvdWxkIHJldHVybiB0aGUgZXhwbGljaXRseSBzcGVjaWZpZWQgZGVsaW1pdGVyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVsaW1pdGVyID0gXCI7XCI7XG4gICAgdmFyIHJvd1N0ciA9IFwiYTtiO2NcIjtcbiAgICB2YXIgcmV0dXJuZWREZWxpbWl0ZXIgPSBnZXREZWxpbWl0ZXIocm93U3RyLCB7IGRlbGltaXRlcjogXCI7XCIgfSk7XG4gICAgYXNzZXJ0LmVxdWFsKHJldHVybmVkRGVsaW1pdGVyLCBkZWxpbWl0ZXIpO1xuICB9KTtcblxuICBpdChcInNob3VsZCByZXR1cm4gdGhlIGF1dG9kZXRlY3RlZCBkZWxpbWl0ZXIgaWYgJ2F1dG8nIHNwZWNpZmllZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJvd1N0ciA9IFwiYTtiO2NcIjtcbiAgICB2YXIgcmV0dXJuZWREZWxpbWl0ZXIgPSBnZXREZWxpbWl0ZXIocm93U3RyLCB7IGRlbGltaXRlcjogXCJhdXRvXCIgfSk7XG4gICAgYXNzZXJ0KHJldHVybmVkRGVsaW1pdGVyID09PSBcIjtcIik7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIHJldHVybiB0aGUgJywnIGRlbGltaXRlciBpZiBkZWxpbWl0ZXIgY2Fubm90IGJlIHNwZWNpZmllZCwgaW4gY2FzZSBvZiAnYXV0bydcIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciByb3dTdHIgPSBcImFiY1wiO1xuICAgIHZhciByZXR1cm5lZERlbGltaXRlciA9IGdldERlbGltaXRlcihyb3dTdHIsIHsgZGVsaW1pdGVyOiBcImF1dG9cIiB9KTtcbiAgICBhc3NlcnQocmV0dXJuZWREZWxpbWl0ZXIgPT09IFwiLFwiKTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgYWNjZXRwIGFuIGFycmF5IHdpdGggcG90ZW50aWFsIGRlbGltaXRlcnNcIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciByb3dTdHIgPSBcImEkYiRjXCI7XG4gICAgdmFyIHJldHVybmVkRGVsaW1pdGVyID0gZ2V0RGVsaW1pdGVyKHJvd1N0ciwgeyBkZWxpbWl0ZXI6IFtcIixcIiwgXCI7XCIsIFwiJFwiXSB9KTtcbiAgICBhc3NlcnQocmV0dXJuZWREZWxpbWl0ZXIgPT09ICckJyk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKFwiUGFyc2VNdWx0aUxpbmUgZnVuY3Rpb25cIiwgZnVuY3Rpb24gKCkge1xuICBjb25zdCByb3dTcGxpdCA9IG5ldyBSb3dTcGxpdChuZXcgQ29udmVydGVyKCkpO1xuICBjb25zdCBmdW5jID0gKGxpbmVzOiBzdHJpbmdbXSk6IE11bHRpcGxlUm93UmVzdWx0ID0+IHtcbiAgICByZXR1cm4gcm93U3BsaXQucGFyc2VNdWx0aUxpbmVzKGxpbmVzKTtcbiAgfVxuICBpdChcInNob3VsZCBjb252ZXJ0IGxpbmVzIHRvIGNzdiBsaW5lc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxpbmVzID0gW1xuICAgICAgXCJhLGIsYyxkXCIsXG4gICAgICBcImhlbGxvLHdvcmxkLGNzdnRvanNvbixhYmNcIixcbiAgICAgIFwiMSwyLDMsNFwiXG4gICAgXTtcbiAgICB2YXIgcmVzID0gZnVuYyhsaW5lcyk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5yb3dzQ2VsbHMubGVuZ3RoLCAzKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLnBhcnRpYWwsIFwiXCIpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBwcm9jZXNzIGxpbmUgYnJlYWtzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGluZXMgPSBbXG4gICAgICBcImEsYixjXCIsXG4gICAgICAnMTVcIixoZWxsbyxcImFiJyxcbiAgICAgIFwiY2RlXFxcIlwiLFxuICAgICAgXCJcXFwiYlxcXCJcXFwiYlxcXCIsY2MsZGRcIlxuICAgIF07XG4gICAgdmFyIHJlcyA9IGZ1bmMobGluZXMpO1xuICAgIGFzc2VydC5lcXVhbChyZXMucm93c0NlbGxzLmxlbmd0aCwgMyk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5yb3dzQ2VsbHNbMV1bMF0sIFwiMTVcXFwiXCIpO1xuICAgIGFzc2VydC5lcXVhbChyZXMucm93c0NlbGxzWzFdWzJdLCBcImFiXFxuY2RlXCIpO1xuICAgIGFzc2VydC5lcXVhbChyZXMucm93c0NlbGxzWzJdWzBdLCBcImJcXFwiYlwiKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLnBhcnRpYWwsIFwiXCIpO1xuICB9KTtcblxuICBpdChcInNob3VsZCByZXR1cm4gcGFydGlhbCBpZiBsaW5lIG5vdCBjbG9zZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBsaW5lcyA9IFtcbiAgICAgIFwiYSxiLGNcIixcbiAgICAgICcxNVwiLGhlbGxvLFwiYWInLFxuICAgICAgXCJkLGUsZlwiXG4gICAgXTtcbiAgICB2YXIgcmVzID0gZnVuYyhsaW5lcyk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5yb3dzQ2VsbHMubGVuZ3RoLCAxKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLnBhcnRpYWwsIFwiMTVcXFwiLGhlbGxvLFxcXCJhYlxcbmQsZSxmXFxuXCIpO1xuICB9KTtcbn0pO1xuXG5kZXNjcmliZShcIlJvd1NwbGl0LnBhcnNlIGZ1bmN0aW9uXCIsIGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgcm93U3BsaXQgPSBuZXcgUm93U3BsaXQobmV3IENvbnZlcnRlcigpKTtcbiAgY29uc3QgZnVuYyA9IChzdHIpOiBSb3dTcGxpdFJlc3VsdCA9PiB7XG4gICAgcmV0dXJuIHJvd1NwbGl0LnBhcnNlKHN0cik7XG4gIH1cbiAgaXQoXCJzaG91bGQgc3BsaXQgY29tcGxldGUgY3N2IGxpbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdHIgPSBcImhlbGxvLHdvcmxkLGNzdnRvanNvbixhd2Vzb21lXCI7XG4gICAgdmFyIHJlcyA9IGZ1bmMoc3RyKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLmNlbGxzLmxlbmd0aCwgNCk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5jbG9zZWQsIHRydWUpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBzcGxpdCBpbmNvbXBsZXRlIGNzdiBsaW5lXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RyID0gXCJoZWxsbyx3b3JsZCxcXFwiY3N2dG9qc29uLGF3ZXNvbWVcIjtcbiAgICB2YXIgcmVzID0gZnVuYyhzdHIpO1xuICAgIGFzc2VydC5lcXVhbChyZXMuY2xvc2VkLCBmYWxzZSk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGFsbG93IG11bHRpcGxlIGxpbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdHIgPSBcIlxcXCJoZVxcXCJsbG9cXFwiLHdvcmxkLFxcXCJjc3Z0b2pzb24sYVxcXCJcXG53ZXNvbWVcXFwiXCI7XG4gICAgdmFyIHJlcyA9IGZ1bmMoc3RyKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLmNsb3NlZCwgdHJ1ZSk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5jZWxsc1syXSwgJ2NzdnRvanNvbixhXCJcXG53ZXNvbWUnKTtcbiAgfSk7XG4gIGl0KFwic2hvdWxkIGFsbG93IGJsYW5rIHF1b3Rlc1wiLCAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IFwiYXxeXnxeYl5cIjtcblxuICAgIGNvbnN0IHJvd1NwbGl0ID0gbmV3IFJvd1NwbGl0KG5ldyBDb252ZXJ0ZXIoe1xuICAgICAgZGVsaW1pdGVyOiAnfCcsXG4gICAgICBxdW90ZTogJ14nLFxuICAgICAgbm9oZWFkZXI6IHRydWVcbiAgICB9KSk7XG4gICAgY29uc3QgcmVzID0gcm93U3BsaXQucGFyc2UoZGF0YSk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5jZWxsc1sxXSwgXCJcIik7XG4gIH0pXG4gIGl0KFwic2hvdWxkIGFsbG93IGJsYW5rIHF1b3RlcyBpbiBxdW90ZXNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSAnYSxcImhlbGxvLHRoaXMsXCJcIiwgdGVzdFwiJztcblxuICAgIGNvbnN0IHJvd1NwbGl0ID0gbmV3IFJvd1NwbGl0KG5ldyBDb252ZXJ0ZXIoe1xuICAgICAgbm9oZWFkZXI6IHRydWVcbiAgICB9KSk7XG4gICAgY29uc3QgcmVzID0gcm93U3BsaXQucGFyc2UoZGF0YSk7XG4gICAgYXNzZXJ0LmVxdWFsKHJlcy5jZWxsc1sxXSwgJ2hlbGxvLHRoaXMsXCIsIHRlc3QnKTtcbiAgfSlcbiAgaXQoXCJzaG91bGQgc21hcnQgZGV0ZWN0IGlmIGFuIGluaXRpYWwgcXVvdGUgaXMgb25seSBwYXJ0IG9mIHZhbHVlIFwiLCAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9ICdcIldlaWdodFwiIChrZyksRXJyb3IgY29kZSxcIkhlaWdodFwiIChtKSc7XG4gICAgY29uc3Qgcm93U3BsaXQgPSBuZXcgUm93U3BsaXQobmV3IENvbnZlcnRlcih7XG4gICAgICBub2hlYWRlcjogdHJ1ZVxuICAgIH0pKTtcbiAgICBjb25zdCByZXMgPSByb3dTcGxpdC5wYXJzZShkYXRhKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLmNlbGxzLmxlbmd0aCwgMyk7XG4gICAgYXNzZXJ0KHJlcy5jbG9zZWQpO1xuICAgIGFzc2VydC5lcXVhbChyZXMuY2VsbHNbMF0sJ1wiV2VpZ2h0XCIgKGtnKScpO1xuICAgIGFzc2VydC5lcXVhbChyZXMuY2VsbHNbMV0sJ0Vycm9yIGNvZGUnKTtcbiAgICBhc3NlcnQuZXF1YWwocmVzLmNlbGxzWzJdLCdcIkhlaWdodFwiIChtKScpO1xuICAgIFxuICB9KVxufSk7XG4iXX0=