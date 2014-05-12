/// <reference path="./definitions/node.d.ts" />

import Crypto = require("crypto");

class Util {
    /**
     * Check if input is a function: if it is not, then return an empty function
     */

    static safeCb(obj: any): any {
        if(typeof obj === "function") {
            return obj;
        }
        else {
            return this.noop;
        }
    }

    /**
     * Remove unwanted characters from a string
     */

    static safeStr(obj: any): string {
        if(this.isString(obj)) {
            return obj.replace(/\s/g, "-").replace(/[^A-Za-z0-9_\-]/g, "").toString();
        }
        return "";
    }

    /**
     * Check if object is empty - from TokBox
     */

    static isEmpty(obj: any): boolean {
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
    }

    /**
     * Check if object is a NOT EMPTY string.
     */

    static isString(obj: any): boolean {
        return typeof obj === "string" && !this.isEmpty(obj);
    }

    /**
     * Check if object is a number.
     */

    static isNumber(obj: any): boolean {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }

    /**
     * Make an SHA256 hash from a string
     */

    static sha256(obj: string): string {
        if(this.isString(obj)) {
            var hash = Crypto.createHash("sha256");
            hash.update(obj);
            return hash.digest("hex");
        }
        return "";
    }

    /**
     * Extend an array - from PeerJS
     */

    static extend(obj: Object, source: Object): Object {
        obj = obj || {};
        if(!this.isEmpty(source)) {
            for(var key in source) {
                if(source.hasOwnProperty(key)) {
                    obj[key] = source[key];
                }
            }
        }
        return obj;
    }

    /**
     * Overwrite an object EXISTING properties, with another object properties
     */

    static overwrite(obj: Object, source: Object): Object {
        if(!this.isEmpty(obj) && !this.isEmpty(source)) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key) && source.hasOwnProperty(key)) {
                    obj[key] = source[key];
                }
            }
        }
        return obj || {};
    }

    /**
     * An empty function
     */

    static noop(...args: any[]): void {

    }
}

export = Util;