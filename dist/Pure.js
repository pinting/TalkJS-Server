var Util = require("./Util");

var Pure = (function () {
    function Pure(socket, parent) {
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
    Pure.prototype.message = function (payload) {
        var _this = this;
        this.log("Message from `" + this.socket.id + "` has been handled:", payload);
        this.parent.io.sockets.clients().some(function (client) {
            if (client.id === payload.peer) {
                payload.peer = _this.socket.id;
                client.emit("message", payload);
                return true;
            }
            return false;
        });
    };
    return Pure;
})();

module.exports = Pure;
