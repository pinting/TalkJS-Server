var Helpers = require("./utils/helpers");
var Connection = require("./connection");
var SocketIO = require("socket.io");
var SQLite = require("sqlite3");
var HTTP = require("http");

function Server(options) {
    var config = {
        ip: "127.0.0.1",
        database: null,
        port: 8000,
        log: true
    };
    var self = this;
    var item;

    for(item in options || {}) {
        if(!Helpers.isNone(options[item])) {
            config[item] = options[item];
        }
    }

    this.database = new SQLite.Database(config.database);
    this.server = HTTP.createServer();
    this.io = SocketIO.listen(this.server, {log: config.log});
    this.server.listen(config.port, config.ip);
    this.io.sockets.on("connection", function(client) {
        new Connection(client, self);
    });
}

module.exports = Server;