var Crypto = require("crypto");

module.exports = {
    /**
     * Check if input is a function: if it is not, the return value will be an empty function
     * @cb {function}
     */

    safeCb: function(cb) {
        if(typeof cb === "function") {
            return cb;
        }
        else {
            return function() {};
        }
    },

    /**
     * Remove unwanted characters from a string (not for messages)
     * @string {string}
     */

    safeStr: function(string) {
        if(this.isString(string)) {
            return string.replace(/\s/g, "-").replace(/[^A-Za-z0-9_\-]/g, "").toString();
        }
        return "";
    },

    /**
     * Check if input is undefined or null, from TokBox
     * @obj {object}
     */

    isNone: function(obj) {
        return obj === undefined || obj === null;
    },

    /**
     * Check if object is empty, from TokBox
     * @obj {object}
     */

    isEmpty: function(obj) {
        if(obj === null || obj === undefined) {
            return true;
        }
        if(Array.isArray(obj) || typeof(obj) === "string") {
            return obj.length === 0;
        }
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Check if object is a NOT EMPTY string.
     * @obj {string}
     */

    isString: function(obj) {
        return typeof obj === "string" && !this.isEmpty(obj);
    },

    /**
     * Check input is object, from TokBox
     * @obj {object}
     */

    isObject: function(obj) {
        return obj === Object(obj);
    },

    /**
     * Make an SHA256 hash from a string
     * @string {string}
     */

    sha256: function(string) {
        if(this.isString(string)) {
            var hash = Crypto.createHash("sha256");
            hash.update(string);
            return hash.digest("hex");
        }
        return "";
    },

    /**
     * Check if an object can be found in a array
     * @array {array}
     * @obj {object}
     */

    find: function(array, obj) {
        return array.indexOf(obj) >= 0;
    }
};