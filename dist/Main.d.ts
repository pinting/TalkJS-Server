/// <reference path="../src/Definitions/socket.io.d.ts" />
/// <reference path="../src/Definitions/node.d.ts" />
import SocketIO = require("socket.io");
import Room = require("./Room");
declare class Main {
    public config: {
        ip: string;
        port: number;
        log: number;
    };
    public io: SocketIO.SocketManager;
    private server;
    constructor(options?: {}, C?: typeof Room);
}
export = Main;
