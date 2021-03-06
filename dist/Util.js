var Crypto = require("crypto");

var Util = (function () {
    function Util() {
    }
    Util.safeCb = function (obj) {
        if (typeof obj === "function") {
            return obj;
        } else {
            return this.noop;
        }
    };

    Util.safeStr = function (obj) {
        if (this.isStr(obj)) {
            return obj.replace(/\s/g, "-").replace(/[^A-Za-z0-9_\-]/g, "").toString();
        }
        return "";
    };

    Util.isEmpty = function (obj) {
        if (obj === null || obj === undefined) {
            return true;
        }
        if (Array.isArray(obj) || typeof (obj) === "string") {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    Util.isStr = function (obj) {
        return typeof obj === "string" && !this.isEmpty(obj);
    };

    Util.sha256 = function (obj) {
        if (this.isStr(obj)) {
            var hash = Crypto.createHash("sha256");
            hash.update(obj);
            return hash.digest("hex");
        }
        return "";
    };

    Util.extend = function (obj, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                obj[key] = source[key];
            }
        }
        return obj;
    };

    Util.noop = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
    };
    return Util;
})();

module.exports = Util;
