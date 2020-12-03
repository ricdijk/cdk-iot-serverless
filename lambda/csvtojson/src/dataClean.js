"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareData = void 0;
const strip_bom_1 = require("strip-bom");
/**
 * For each data chunk coming to parser:
 * 1. append the data to the buffer that is left from last chunk
 * 2. check if utf8 chars being split, if does, stripe the bytes and add to left buffer.
 * 3. stripBom
 */
function prepareData(chunk, runtime) {
    const workChunk = concatLeftChunk(chunk, runtime);
    runtime.csvLineBuffer = undefined;
    const cleanCSVString = cleanUtf8Split(workChunk, runtime).toString("utf8");
    if (runtime.started === false) {
        return strip_bom_1.default(cleanCSVString);
    }
    else {
        return cleanCSVString;
    }
}
exports.prepareData = prepareData;
/**
 *  append data to buffer that is left form last chunk
 */
function concatLeftChunk(chunk, runtime) {
    if (runtime.csvLineBuffer && runtime.csvLineBuffer.length > 0) {
        return Buffer.concat([runtime.csvLineBuffer, chunk]);
    }
    else {
        return chunk;
    }
}
/**
 * check if utf8 chars being split, if does, stripe the bytes and add to left buffer.
 */
function cleanUtf8Split(chunk, runtime) {
    let idx = chunk.length - 1;
    /**
     * From Keyang:
     * The code below is to check if a single utf8 char (which could be multiple bytes) being split.
     * If the char being split, the buffer from two chunk needs to be concat
     * check how utf8 being encoded to understand the code below.
     * If anyone has any better way to do this, please let me know.
     */
    if ((chunk[idx] & 1 << 7) != 0) {
        while ((chunk[idx] & 3 << 6) === 128) {
            idx--;
        }
        idx--;
    }
    if (idx != chunk.length - 1) {
        runtime.csvLineBuffer = chunk.slice(idx + 1);
        return chunk.slice(0, idx + 1);
        // var _cb=cb;
        // var self=this;
        // cb=function(){
        //   if (self._csvLineBuffer){
        //     self._csvLineBuffer=Buffer.concat([bufFromString(self._csvLineBuffer,"utf8"),left]);
        //   }else{
        //     self._csvLineBuffer=left;
        //   }
        //   _cb();
        // }
    }
    else {
        return chunk;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUNsZWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGF0YUNsZWFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlDQUFpQztBQUNqQzs7Ozs7R0FLRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxLQUFhLEVBQUUsT0FBcUI7SUFDOUQsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxPQUFPLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztJQUNsQyxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxFQUFFO1FBQzdCLE9BQU8sbUJBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNqQztTQUFNO1FBQ0wsT0FBTyxjQUFjLENBQUM7S0FDdkI7QUFDSCxDQUFDO0FBVEQsa0NBU0M7QUFDRDs7R0FFRztBQUNILFNBQVMsZUFBZSxDQUFDLEtBQWEsRUFBRSxPQUFxQjtJQUMzRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN0RDtTQUFNO1FBQ0wsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUFDRDs7R0FFRztBQUNILFNBQVMsY0FBYyxDQUFDLEtBQWEsRUFBRSxPQUFxQjtJQUMxRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUMzQjs7Ozs7O09BTUc7SUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ3BDLEdBQUcsRUFBRSxDQUFDO1NBQ1A7UUFDRCxHQUFHLEVBQUUsQ0FBQztLQUNQO0lBQ0QsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3QyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM5QixjQUFjO1FBQ2QsaUJBQWlCO1FBQ2pCLGlCQUFpQjtRQUNqQiw4QkFBOEI7UUFDOUIsMkZBQTJGO1FBQzNGLFdBQVc7UUFDWCxnQ0FBZ0M7UUFDaEMsTUFBTTtRQUNOLFdBQVc7UUFDWCxJQUFJO0tBQ0w7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFyc2VSdW50aW1lIH0gZnJvbSBcIi4vUGFyc2VSdW50aW1lXCI7XG5pbXBvcnQgc3RyaXBCb20gZnJvbSBcInN0cmlwLWJvbVwiO1xuLyoqXG4gKiBGb3IgZWFjaCBkYXRhIGNodW5rIGNvbWluZyB0byBwYXJzZXI6XG4gKiAxLiBhcHBlbmQgdGhlIGRhdGEgdG8gdGhlIGJ1ZmZlciB0aGF0IGlzIGxlZnQgZnJvbSBsYXN0IGNodW5rXG4gKiAyLiBjaGVjayBpZiB1dGY4IGNoYXJzIGJlaW5nIHNwbGl0LCBpZiBkb2VzLCBzdHJpcGUgdGhlIGJ5dGVzIGFuZCBhZGQgdG8gbGVmdCBidWZmZXIuXG4gKiAzLiBzdHJpcEJvbSBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVEYXRhKGNodW5rOiBCdWZmZXIsIHJ1bnRpbWU6IFBhcnNlUnVudGltZSk6IHN0cmluZyB7XG4gIGNvbnN0IHdvcmtDaHVuayA9IGNvbmNhdExlZnRDaHVuayhjaHVuaywgcnVudGltZSk7XG4gIHJ1bnRpbWUuY3N2TGluZUJ1ZmZlciA9IHVuZGVmaW5lZDtcbiAgY29uc3QgY2xlYW5DU1ZTdHJpbmcgPSBjbGVhblV0ZjhTcGxpdCh3b3JrQ2h1bmssIHJ1bnRpbWUpLnRvU3RyaW5nKFwidXRmOFwiKTtcbiAgaWYgKHJ1bnRpbWUuc3RhcnRlZCA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gc3RyaXBCb20oY2xlYW5DU1ZTdHJpbmcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbGVhbkNTVlN0cmluZztcbiAgfVxufVxuLyoqXG4gKiAgYXBwZW5kIGRhdGEgdG8gYnVmZmVyIHRoYXQgaXMgbGVmdCBmb3JtIGxhc3QgY2h1bmtcbiAqL1xuZnVuY3Rpb24gY29uY2F0TGVmdENodW5rKGNodW5rOiBCdWZmZXIsIHJ1bnRpbWU6IFBhcnNlUnVudGltZSk6IEJ1ZmZlciB7XG4gIGlmIChydW50aW1lLmNzdkxpbmVCdWZmZXIgJiYgcnVudGltZS5jc3ZMaW5lQnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbcnVudGltZS5jc3ZMaW5lQnVmZmVyLCBjaHVua10pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjaHVuaztcbiAgfVxufVxuLyoqXG4gKiBjaGVjayBpZiB1dGY4IGNoYXJzIGJlaW5nIHNwbGl0LCBpZiBkb2VzLCBzdHJpcGUgdGhlIGJ5dGVzIGFuZCBhZGQgdG8gbGVmdCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsZWFuVXRmOFNwbGl0KGNodW5rOiBCdWZmZXIsIHJ1bnRpbWU6IFBhcnNlUnVudGltZSk6IEJ1ZmZlciB7XG4gIGxldCBpZHggPSBjaHVuay5sZW5ndGggLSAxO1xuICAvKipcbiAgICogRnJvbSBLZXlhbmc6XG4gICAqIFRoZSBjb2RlIGJlbG93IGlzIHRvIGNoZWNrIGlmIGEgc2luZ2xlIHV0ZjggY2hhciAod2hpY2ggY291bGQgYmUgbXVsdGlwbGUgYnl0ZXMpIGJlaW5nIHNwbGl0LlxuICAgKiBJZiB0aGUgY2hhciBiZWluZyBzcGxpdCwgdGhlIGJ1ZmZlciBmcm9tIHR3byBjaHVuayBuZWVkcyB0byBiZSBjb25jYXRcbiAgICogY2hlY2sgaG93IHV0ZjggYmVpbmcgZW5jb2RlZCB0byB1bmRlcnN0YW5kIHRoZSBjb2RlIGJlbG93LiBcbiAgICogSWYgYW55b25lIGhhcyBhbnkgYmV0dGVyIHdheSB0byBkbyB0aGlzLCBwbGVhc2UgbGV0IG1lIGtub3cuXG4gICAqL1xuICBpZiAoKGNodW5rW2lkeF0gJiAxIDw8IDcpICE9IDApIHtcbiAgICB3aGlsZSAoKGNodW5rW2lkeF0gJiAzIDw8IDYpID09PSAxMjgpIHtcbiAgICAgIGlkeC0tO1xuICAgIH1cbiAgICBpZHgtLTtcbiAgfVxuICBpZiAoaWR4ICE9IGNodW5rLmxlbmd0aCAtIDEpIHtcbiAgICBydW50aW1lLmNzdkxpbmVCdWZmZXIgPSBjaHVuay5zbGljZShpZHggKyAxKTtcbiAgICByZXR1cm4gY2h1bmsuc2xpY2UoMCwgaWR4ICsgMSlcbiAgICAvLyB2YXIgX2NiPWNiO1xuICAgIC8vIHZhciBzZWxmPXRoaXM7XG4gICAgLy8gY2I9ZnVuY3Rpb24oKXtcbiAgICAvLyAgIGlmIChzZWxmLl9jc3ZMaW5lQnVmZmVyKXtcbiAgICAvLyAgICAgc2VsZi5fY3N2TGluZUJ1ZmZlcj1CdWZmZXIuY29uY2F0KFtidWZGcm9tU3RyaW5nKHNlbGYuX2NzdkxpbmVCdWZmZXIsXCJ1dGY4XCIpLGxlZnRdKTtcbiAgICAvLyAgIH1lbHNle1xuICAgIC8vICAgICBzZWxmLl9jc3ZMaW5lQnVmZmVyPWxlZnQ7XG4gICAgLy8gICB9XG4gICAgLy8gICBfY2IoKTtcbiAgICAvLyB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNodW5rO1xuICB9XG59Il19