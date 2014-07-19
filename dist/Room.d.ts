/// <reference path="../src/Definitions/socket.io.d.ts" />
/// <reference path="../src/Definitions/node.d.ts" />
import SocketIO = require("socket.io");
import Pure = require("./Pure");
import Main = require("./Main");
declare class Room extends Pure {
    constructor(socket: SocketIO.Socket, parent: Main);
    private getRoomClients(room);
    private join(room, type, cb);
    private leave();
    private disconnect();
}
export = Room;
