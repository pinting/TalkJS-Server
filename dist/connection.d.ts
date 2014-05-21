/// <reference path="../src/definitions/socket.io.d.ts" />
/// <reference path="../src/definitions/node.d.ts" />
/// <reference path="../src/definitions/talk.d.ts" />
import SocketIO = require("socket.io");
import Main = require("./main");
declare class Connection {
    public warn: (...args: any[]) => void;
    public log: (...args: any[]) => void;
    public parent: Main;
    public client: any;
    constructor(client: SocketIO.Socket, parent: Main);
    public message(payload: Message): void;
}
export = Connection;
