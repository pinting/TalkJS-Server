/// <reference path="../src/definitions/socket.io.d.ts" />
/// <reference path="../src/definitions/node.d.ts" />
import Connection = require("./connection");
import SocketIO = require("socket.io");
import Main = require("./main");
declare class Room extends Connection {
    constructor(client: SocketIO.Socket, parent: Main);
    private getRoomClients(room);
    private join(room, type, cb);
    private leave();
    private disconnect();
}
export = Room;
