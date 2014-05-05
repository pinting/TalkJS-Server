var Util = require("./util");

var Connection = (function () {
    function Connection(client, parent) {
        var _this = this;
        this.warn = Util.noop;
        this.log = Util.noop;
        this.warn = parent.io.log.warn.bind(parent.io.log);
        this.log = parent.io.log.info.bind(parent.io.log);
        this.parent = parent;
        this.client = client;

        ["message"].forEach(function (method) {
            _this.client.on(method, _this[method].bind(_this));
        });
    }
    Connection.prototype.message = function (payload) {
        var _this = this;
        this.log("Handling message:", payload);
        this.parent.io.sockets.clients().some(function (client) {
            if (client.id === payload.peer) {
                payload.peer = _this.client.id;
                client.emit("message", payload);
                return true;
            }
            return false;
        });
    };
    return Connection;
})();

module.exports = Connection;
