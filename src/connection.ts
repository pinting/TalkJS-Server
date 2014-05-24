/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import SocketIO = require("socket.io");
import Main = require("./main");
import Util = require("./util");

interface Message {
    handler: any[];
    peer: string;
    key: string;
    value: any;
}

class Connection {
    public warn = Util.noop;
    public log = Util.noop;
    public parent: Main;
    public socket: any;

    /**
     * Connection can send and receive messages between connected sockets.
     * @param {SocketIO.Socket} socket
     * @param {Main} parent
     */

    constructor(socket: SocketIO.Socket, parent: Main) {
        this.warn = parent.io.log.warn.bind(parent.io.log);
        this.log = parent.io.log.info.bind(parent.io.log);
        this.parent = parent;
        this.socket = socket;

        ["message"].forEach((method: string) => {
            this.socket.on(method, this[method].bind(this));
        });
    }

    /**
     * Send a message to someone else
     * @param {Connection.Message} payload
     */

    private message(payload: Message): void {
        this.log("Handling message from `" + this.socket.id + "`:", payload);
        this.parent.io.sockets.clients().some((client: SocketIO.Socket) => {
            if(client.id === payload.peer) {
                payload.peer = this.socket.id;
                client.emit("message", payload);
                return true;
            }
            return false;
        });
    }
}

export = Connection;