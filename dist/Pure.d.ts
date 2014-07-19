/// <reference path="../src/Definitions/socket.io.d.ts" />
/// <reference path="../src/Definitions/node.d.ts" />
/// <reference path="IMessage.d.ts" />
import SocketIO = require("socket.io");
import Main = require("./Main");
declare class Pure {
    public warn: (...args: any[]) => void;
    public log: (...args: any[]) => void;
    public parent: Main;
    public socket: any;
    constructor(socket: SocketIO.Socket, parent: Main);
    private message(payload);
}
export = Pure;
