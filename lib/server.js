var FriendConnection = require("./connection/friend");
var RoomConnection = require("./connection/room");
var SocketIO = require("socket.io");
var SQLite = require("sqlite3");
var Util = require("./util");
var HTTP = require("http");

function Server(options) {
    var config = {
        ip: "127.0.0.1",
        database: null,
        port: 8000,
        log: false
    };
    var self = this;
    var item;

    for(item in options || {}) {
        if(!Util.isNone(options[item])) {
            config[item] = options[item];
        }
    }

    if(!Util.isNone(config.database)) {
        this.database = new SQLite.Database(config.database);
    }

    this.server = HTTP.createServer();
    this.io = SocketIO.listen(this.server, {log: config.log});
    this.server.listen(config.port, config.ip);
    this.io.sockets.on("connection", function(client) {
        if(Util.isNone(config.database)) {
            new RoomConnection(client, self);
        }
        else {
            new FriendConnection(client, self);
        }
    });
}

module.exports = Server;