/// <reference path="./Definitions/socket.io" />
/// <reference path="./Definitions/node" />
/// <reference path="./IMessage" />

import SocketIO = require("socket.io");
import Main = require("./Main");
import Util = require("./Util");

class Pure {
    public warn = Util.noop;
    public log = Util.noop;
    public parent: Main;
    public socket: any;

    /**
     * Pure connection can send and receive messages between connected sockets.
     * @param socket
     * @param parent
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
     * @param payload
     */

    private message(payload: IMessage): void {
        this.log("Message from `" + this.socket.id + "` has been handled:", payload);
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

export = Pure;