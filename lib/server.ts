/// <reference path="./socket.io/socket.io.d.ts" />
/// <reference path="./sqlite3/sqlite3.d.ts" />
/// <reference path="./node/node.d.ts" />

import Connection = require("./connection");
import SocketIO = require("socket.io");
import SQLite = require("sqlite3");
import Util = require("./util");
import HTTP = require("http");

class Server {
    public config = {
        ip: "127.0.0.1",
        database: null,
        port: 8000,
        log: false
    };
    public io: SocketIO.SocketManager;
    public database: SQLite.Database;
    private server: HTTP.Server;

    constructor(options: Object) {
        Util.overwrite(this.config, options)

        if(this.config.database) {
            this.database = new SQLite.Database(this.config.database);
            this.database.run(
                    "CREATE TABLE IF NOT EXISTS Users (" +
                    "Username VARCHAR(64), " +
                    "Password VARCHAR(64), " +
                    "Friends TEXT(4096)," +
                    "UNIQUE(Username)" +
                    ");"
            );
        }

        this.server = HTTP.createServer();
        this.io = SocketIO.listen(this.server, {log: this.config.log});
        this.server.listen(this.config.port, this.config.ip);
        this.io.sockets.on("connection", (client) => {
            new Connection(client, this);
        });
    }
}

export = Server;