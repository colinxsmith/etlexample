var parseObj = require("./build/Release/PARSER");
var DATA = new parseObj.StringMap();
var line_len = 50000;
let read = '';
for (let i = 0; i < line_len; ++i) {
    read += 'a';
}
var fwords = new parseObj.StringVector(),
    space = ' ',
    parseFile = 'portfolioU';
var keys = 'n names DATA tlen';
var scalars = 'n tlen';
try {
    var back = parseObj.Parser(parseFile, keys, read, line_len, fwords, DATA, space);
    if (back === 1) throw ('Bad file name')
} catch (error) {
    exports.parseFile = error;
    return;
}
keys.split(' ').forEach(kk => {
    console.log(kk);
    var sss = scalars.split(' ');
    if (sss.includes(kk)) {
        console.log('scalar\t', kk, +parseObj.gets(DATA, kk));
    } else {
        console.log(kk, (parseObj.getv(DATA, kk)) === undefined ? 'blank' : 'length ' + (parseObj.getv(DATA, kk)).length);
    }
});
console.log('Keywords in data file\t', fwords.size(), 'number searched by parser\t', keys.split(' ').length);
parseObj.printvvec(fwords);
var hist = parseObj.getv(DATA, 'DATA');
var tlen = +parseObj.gets(DATA, 'tlen');
var n = +parseObj.gets(DATA, 'n');
var names = parseObj.getv(DATA, 'names');
console.log(n, hist.length, tlen, hist.length / tlen);
exports.hist = hist;
exports.n = n;
exports.names = names;
exports.tlen = tlen;