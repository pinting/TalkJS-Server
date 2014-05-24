/// <reference path="../src/definitions/node.d.ts" />
declare class Util {
    static safeCb(obj: any): any;
    static safeStr(obj: string): string;
    static isEmpty(obj: any): boolean;
    static isStr(obj: any): boolean;
    static sha256(obj: string): string;
    static extend(obj: Object, source: Object): Object;
    static noop(...args: any[]): void;
}
export = Util;
