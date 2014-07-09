/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import SocketIO = require("socket.io");
import Pure = require("./pure");
import Main = require("./main");
import Util = require("./util");

class Room extends Pure {
    /**
     * Room is an advanced type of connection: it connects sockets
     * who are in the same room.
     * @param {SocketIO.Socket} socket
     * @param {Main} parent
     */

    constructor(socket: SocketIO.Socket, parent: Main) {
        super(socket, parent);
        this.socket.type = null;

        ["join", "leave", "disconnect"].forEach((method: string) => {
            this.socket.on(method, this[method].bind(this));
        });
    }

    /**
     * Get the clients of the given room
     * @param {string} room
     * @returns {Array}
     */

    private getRoomClients(room: string): any[] {
        var clients = this.parent.io.sockets.clients(room);
        var result = [];

        clients.forEach((client: any) => {
            if(this.socket.id !== client.id) {
                result.push({
                    type: client.type,
                    id: client.id
                });
            }
        });
        return result;
    }

    /**
     * Join to a room
     * @param {string} room - Name of the room
     * @param {string} type
     * @param {Function} cb
     */

    private join(room: string, type: string, cb: (error: any, clients?: any[]) => void): void {
        room = Util.safeStr(room);
        type = Util.safeStr(type);
        cb = Util.safeCb(cb);

        if(!room) {
            this.log("Invalid room name was used by `" + this.socket.id + "`:", room);
            cb("invalidRoom");
            return;
        }
        if(!type) {
            this.log("Invalid room type was used by `" + this.socket.id + "`:", type);
            cb("invalidType");
            return;
        }

        var clients = this.getRoomClients(room);
        for(var id in clients) {
            if(clients[id].id !== this.socket.id && clients[id].type !== type) {
                this.log("Invalid room type was used by `" + this.socket.id + "`:", type);
                cb("typeError");
                return;
            }
        }

        if(this.socket.room) {
            this.leave();
        }

        this.log("Client `" + this.socket.id + "` was joined room `" + room + "`");
        this.socket.type = type;
        this.socket.join(room);
        cb(null, clients);
    }

    /**
     * Leave the current room
     */

    private leave(): void {
        this.socket.broadcast.to(this.socket.room).emit("remove", this.socket.id);
        this.log("Client `" + this.socket.id + "` was left room `" + this.socket.room + "`");
        this.socket.leave(this.socket.room);
        this.socket.type = null;
    }

    /**
     * Executed when socket was disconnected
     */

    private disconnect(): void {
        this.log("Client `" + this.socket.id + "` was disconnected");
        this.leave();
    }
}

export = Room;