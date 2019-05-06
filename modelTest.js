function addstrnums(str) {
    var tmp = str.replace(/[^0-9]/ig, "");
    var pos = str.indexOf(tmp);

    if (tmp != "") {
        var nn = parseInt(tmp) + 1;
        nn = pad(nn, tmp.length);
        var left = str.substring(0, pos);
        var right = str.substring(pos + tmp.length);
        return left + nn + right;
    }
    else {
        return str;
    }
}

pad = function (tbl) {
    return function (num, n) {
        return (0 >= (n = n - num.toString().length)) ? num : (tbl[n] || (tbl[n] = Array(n + 1).join(0))) + num;
    }
}([]);

addstrnums('00001')