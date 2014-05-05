/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import SocketIO = require("socket.io");
import Main = require("./main");
import Util = require("./util");

class Connection {
    private warn = Util.noop;
    private log = Util.noop;
    private parent: Main;
    private client: any;

    constructor(client: SocketIO.Socket, parent: Main) {
        this.warn = parent.io.log.warn.bind(parent.io.log);
        this.log = parent.io.log.info.bind(parent.io.log);
        this.parent = parent;
        this.client = client;

        ["message"].forEach((method) => {
            this.client.on(method, this[method].bind(this));
        });
    }

    /**
     * Send a message to someone else
     * @message {object}
     */

    public message(payload) {
        this.log("Handling message:", payload);
        this.parent.io.sockets.clients().some((client) => {
            if(client.id === payload.peer) {
                payload.peer = this.client.id;
                client.emit("message", payload);
                return true;
            }
            return false;
        });
    }
}

export = Connection;