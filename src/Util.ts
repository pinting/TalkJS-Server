/// <reference path="./Definitions/node" />

import Crypto = require("crypto");

class Util {
    /**
     * Check if input is a function: if it is not, then return an empty function
     * @param obj
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
     * @param obj
     */

    static safeStr(obj: string): string {
        if(this.isStr(obj)) {
            return obj.replace(/\s/g, "-").replace(/[^A-Za-z0-9_\-]/g, "").toString();
        }
        return "";
    }

    /**
     * Check if object is empty - from TokBox
     * @param obj
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
     * @param obj
     */

    static isStr(obj: any): boolean {
        return typeof obj === "string" && !this.isEmpty(obj);
    }

    /**
     * Make an SHA256 hash from a string
     * @param obj
     */

    static sha256(obj: string): string {
        if(this.isStr(obj)) {
            var hash = Crypto.createHash("sha256");
            hash.update(obj);
            return hash.digest("hex");
        }
        return "";
    }

    /**
     * Extend an array - from PeerJS
     * @param obj
     * @param source
     */

    static extend(obj: Object, source: Object): Object {
        for(var key in source) {
            if(source.hasOwnProperty(key)) {
                obj[key] = source[key];
            }
        }
        return obj;
    }

    /**
     * An empty function
     * @param [args]
     */

    static noop(...args: any[]): void {

    }
}

export = Util;