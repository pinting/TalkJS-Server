/// <reference path="../src/definitions/socket.io.d.ts" />
/// <reference path="../src/definitions/node.d.ts" />
import SocketIO = require("socket.io");
import Room = require("./room");
declare class Main {
    public config: {
        connection: typeof Room;
        ip: string;
        port: number;
        log: number;
    };
    public io: SocketIO.SocketManager;
    private server;
    constructor(options: Object);
}
export = Main;
