/// <reference path="./socket.io/socket.io.d.ts" />
/// <reference path="./sqlite3/sqlite3.d.ts" />
/// <reference path="./node/node.d.ts" />

import SocketIO = require("socket.io");
import Server = require("./server");
import Util = require("./util");

class Connection {
    private parent: Server;
    private client: any;

    constructor(client: SocketIO.Socket, parent: Server) {
        this.parent = parent;
        this.client = client;
        this.client.loggedIn = false;
        this.client.username = null;
        this.client.roomType = null;
        this.client.room = null;

        ["message"].forEach((method) => {
            this.client.on(method, this[method].bind(self));
        });
    }

    /**
     * Send a message to someone else
     * @message {object}
     */

    public message(type, payload) {
        var client = this.parent.io.sockets.sockets[payload.peer];
        if(client) {
            payload.peer = this.client.id;
            client.emit("message", type, payload);
        }
    }
}

export = Connection;