// source: https://gist.github.com/redteam-snippets/3934258
function gcd(a, b) {
	return (b) ? gcd(b, a % b) : a;
}
var decimalToFraction = function (_decimal) {
    if (_decimal === parseInt(_decimal)) {
        return {
            top: parseInt(_decimal),
            bottom: 1,
            display: parseInt(_decimal) + '/' + 1
        };
    }
    else {
        var top = _decimal.toString().includes(".") ? _decimal.toString().replace(/\d+[.]/, '') : 0;
        var bottom = Math.pow(10, top.toString().replace('-','').length);
        if (_decimal >= 1) {
            top = +top + (Math.floor(_decimal) * bottom);
        }
        else if (_decimal <= -1) {
            top = +top + (Math.ceil(_decimal) * bottom);
        }

        var x = Math.abs(gcd(top, bottom));
        return {
            top: (top / x),
            bottom: (bottom / x),
            display: (top / x) + '/' + (bottom / x)
        };
    }
};

export default decimalToFraction