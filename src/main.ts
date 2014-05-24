/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import SocketIO = require("socket.io");
import Room = require("./room");
import Util = require("./util");
import HTTP = require("http");

class Main {
    public config = {
        ip: "127.0.0.1",
        port: 8000,
        log: 3
    };
    public io: SocketIO.SocketManager;
    private server: HTTP.Server;

    /**
     * Main is the top layer of the server: it handles new connections.
     * @param {Main.config} options
     * @param {Room} [C] - Custom connection handler
     */

    constructor(options: Object, C = Room) {
        Util.extend(this.config, options);
        this.server = HTTP.createServer();
        this.io = SocketIO.listen(this.server, {log: this.config.log});
        this.io.set("log level", this.config.log);
        this.server.listen(this.config.port, this.config.ip);
        this.io.sockets.on("connection", (socket: SocketIO.Socket) => {
            new C(socket, this);
        });
    }
}

export = Main;