/// <reference path="./definitions/socket.io.d.ts" />
/// <reference path="./definitions/node.d.ts" />

import Connection = require("./connection");
import SocketIO = require("socket.io");
import Util = require("./util");
import HTTP = require("http");

class Main {
    public config = {
        connection: Connection,
        ip: "127.0.0.1",
        port: 8000,
        log: 3
    };
    private server: HTTP.Server;
    public io: any;

    constructor(options: Object) {
        Util.overwrite(this.config, options);
        this.server = HTTP.createServer();
        this.io = <any> SocketIO.listen(this.server, {log: this.config.log});
        this.io.set("log level", this.config.log);
        this.server.listen(this.config.port, this.config.ip);
        this.io.sockets.on("connection", (client) => {
            new this.config.connection(client, this);
        });
    }
}

export = Main;