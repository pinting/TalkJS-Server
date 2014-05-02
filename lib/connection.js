var Connection = (function () {
    function Connection(client, parent) {
        var _this = this;
        this.parent = parent;
        this.client = client;
        this.client.loggedIn = false;
        this.client.username = null;
        this.client.roomType = null;
        this.client.room = null;

        ["message"].forEach(function (method) {
            _this.client.on(method, _this[method].bind(self));
        });
    }
    Connection.prototype.message = function (type, payload) {
        var client = this.parent.io.sockets.sockets[payload.peer];
        if (client) {
            payload.peer = this.client.id;
            client.emit("message", type, payload);
        }
    };
    return Connection;
})();

module.exports = Connection;
