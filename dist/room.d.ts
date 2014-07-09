/// <reference path="../src/definitions/socket.io.d.ts" />
/// <reference path="../src/definitions/node.d.ts" />
import SocketIO = require("socket.io");
import Pure = require("./pure");
import Main = require("./main");
declare class Room extends Pure {
    constructor(socket: SocketIO.Socket, parent: Main);
    private getRoomClients(room);
    private join(room, type, cb);
    private leave();
    private disconnect();
}
export = Room;
