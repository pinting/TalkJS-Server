/// <reference path="../src/definitions/socket.io.d.ts" />
/// <reference path="../src/definitions/node.d.ts" />
import SocketIO = require("socket.io");
import Main = require("./main");
declare class Pure {
    public warn: (...args: any[]) => void;
    public log: (...args: any[]) => void;
    public parent: Main;
    public socket: any;
    constructor(socket: SocketIO.Socket, parent: Main);
    private message(payload);
}
export = Pure;
