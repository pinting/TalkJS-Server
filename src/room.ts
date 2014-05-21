/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import Connection = require("./connection");
import SocketIO = require("socket.io");
import Main = require("./main");
import Util = require("./util");

class Room extends Connection {
    constructor(client: SocketIO.Socket, parent: Main) {
        super(client, parent);
        this.client.type = null;

        ["join", "leave", "disconnect"].forEach((method: string) => {
            this.client.on(method, this[method].bind(this));
        });
    }

    /**
     * Get the clients of the given room
     */

    private getRoomClients(room: string): any[] {
        var clients = this.parent.io.sockets.clients(room);
        var result = [];

        clients.forEach((client: any) => {
            if(this.client.id !== client.id) {
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
     */

    private join(room: string, type: string, cb: (error: any, clients?: any[]) => void): void {
        room = Util.safeStr(room);
        type = Util.safeStr(type);
        cb = Util.safeCb(cb);

        if(!room) {
            this.log("Invalid room name was used by `" + this.client.id + "`:", room);
            cb("invalidRoom");
            return;
        }
        if(!type) {
            this.log("Invalid room type was used by `" + this.client.id + "`:", type);
            cb("invalidType");
            return;
        }

        var clients = this.getRoomClients(room);
        for(var id in clients) {
            if(clients[id].id !== this.client.id && clients[id].type !== type) {
                this.log("Type error by `" + this.client.id + "`:", type);
                cb("typeError");
                return;
            }
        }

        if(this.client.room) {
            this.leave();
        }

        this.log("Client `" + this.client.id + "` has joined to room `" + room + "`");
        this.client.type = type;
        this.client.join(room);
        cb(null, clients);
    }

    /**
     * Leave the current room
     */

    private leave(): void {
        this.client.broadcast.to(this.client.room).emit("remove", this.client.id);
        this.log("Client `" + this.client.id + "` has left the room `" + this.client.room + "`");
        this.client.leave(this.client.room);
        this.client.type = null;
    }

    /**
     * Executed when socket was disconnected
     */

    private disconnect(): void {
        this.log("Client `" + this.client.id + "` has disconnected");
        this.leave();
    }
}

export = Room;