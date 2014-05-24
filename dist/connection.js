var Util = require("./util");

var Connection = (function () {
    function Connection(socket, parent) {
        var _this = this;
        this.warn = Util.noop;
        this.log = Util.noop;
        this.warn = parent.io.log.warn.bind(parent.io.log);
        this.log = parent.io.log.info.bind(parent.io.log);
        this.parent = parent;
        this.socket = socket;

        ["message"].forEach(function (method) {
            _this.socket.on(method, _this[method].bind(_this));
        });
    }
    Connection.prototype.message = function (payload) {
        var _this = this;
        this.log("Handling message from `" + this.socket.id + "`:", payload);
        this.parent.io.sockets.clients().some(function (client) {
            if (client.id === payload.peer) {
                payload.peer = _this.socket.id;
                client.emit("message", payload);
                return true;
            }
            return false;
        });
    };
    return Connection;
})();

module.exports = Connection;
