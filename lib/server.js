var Connection = require("./connection");
var SocketIO = require("socket.io");
var SQLite = require("sqlite3");
var Util = require("./util");
var HTTP = require("http");

var Server = (function () {
    function Server(options) {
        var _this = this;
        this.config = {
            ip: "127.0.0.1",
            database: null,
            port: 8000,
            log: false
        };
        Util.overwrite(this.config, options);

        if (this.config.database) {
            this.database = new SQLite.Database(this.config.database);
            this.database.run("CREATE TABLE IF NOT EXISTS Users (" + "Username VARCHAR(64), " + "Password VARCHAR(64), " + "Friends TEXT(4096)," + "UNIQUE(Username)" + ");");
        }

        this.server = HTTP.createServer();
        this.io = SocketIO.listen(this.server, { log: this.config.log });
        this.server.listen(this.config.port, this.config.ip);
        this.io.sockets.on("connection", function (client) {
            new Connection(client, _this);
        });
    }
    return Server;
})();

module.exports = Server;
