var SocketIO = require("socket.io");
var Room = require("./room");
var Util = require("./util");
var HTTP = require("http");

var Main = (function () {
    function Main(options) {
        var _this = this;
        this.config = {
            connection: Room,
            ip: "127.0.0.1",
            port: 8000,
            log: 3
        };
        Util.extend(this.config, options);
        this.server = HTTP.createServer();
        this.io = SocketIO.listen(this.server, { log: this.config.log });
        this.io.set("log level", this.config.log);
        this.server.listen(this.config.port, this.config.ip);
        this.io.sockets.on("connection", function (socket) {
            new _this.config.connection(socket, _this);
        });
    }
    return Main;
})();

module.exports = Main;
