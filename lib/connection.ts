/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/talk.d.ts" />

import SocketIO = require("socket.io");
import Main = require("./main");
import Util = require("./util");

class Connection {
    public warn = Util.noop;
    public log = Util.noop;
    public parent: Main;
    public client: any;

    constructor(client: SocketIO.Socket, parent: Main) {
        this.warn = parent.io.log.warn.bind(parent.io.log);
        this.log = parent.io.log.info.bind(parent.io.log);
        this.parent = parent;
        this.client = client;

        ["message"].forEach((method: string) => {
            this.client.on(method, this[method].bind(this));
        });
    }

    /**
     * Send a message to someone else
     */

    public message(payload: Message): void {
        this.log("Handling message:", payload);
        this.parent.io.sockets.clients().some((client: SocketIO.Socket) => {
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