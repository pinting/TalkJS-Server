/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/talk.d.ts" />

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

    private join(room: string, type: string, cb: (error: any, clients?: any[]) => void): void {
        room = Util.safeStr(room);
        type = Util.safeStr(type);
        cb = Util.safeCb(cb);

        if(!room) {
            cb("invalidRoom");
            return;
        }
        if(!type) {
            cb("invalidType");
            return;
        }

        var clients = this.getRoomClients(room);
        for(var id in clients) {
            if(clients[id].id !== this.client.id && clients[id].type !== type) {
                cb("typeError");
                return;
            }
        }

        if(this.client.room) {
            this.leave();
        }

        this.client.type = type;
        this.client.join(room);
        cb(null, clients);
    }

    private leave(): void {
        this.parent.io.sockets.in(this.client.room).emit("remove", this.client.id);
        this.client.leave(this.client.room);
        this.client.type = null;
    }

    private disconnect(): void {
        if(this.client.room) {
            this.leave();
        }
    }
}

export = Room;