var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Connection = require("./connection");

var Util = require("./util");

var Room = (function (_super) {
    __extends(Room, _super);
    function Room(client, parent) {
        var _this = this;
        _super.call(this, client, parent);
        this.client.type = null;

        ["join", "leave", "disconnect"].forEach(function (method) {
            _this.client.on(method, _this[method].bind(_this));
        });
    }
    Room.prototype.getRoomClients = function (room) {
        var _this = this;
        var clients = this.parent.io.sockets.clients(room);
        var result = [];

        clients.forEach(function (client) {
            if (_this.client.id !== client.id) {
                result.push({
                    type: client.type,
                    id: client.id
                });
            }
        });
        return result;
    };

    Room.prototype.join = function (room, type, cb) {
        room = Util.safeStr(room);
        type = Util.safeStr(type);
        cb = Util.safeCb(cb);

        if (!room) {
            cb("invalidRoom");
            return;
        }
        if (!type) {
            cb("invalidType");
            return;
        }

        var clients = this.getRoomClients(room);
        for (var id in clients) {
            if (clients[id].id !== this.client.id && clients[id].type !== type) {
                cb("typeError");
                return;
            }
        }

        if (this.client.room) {
            this.leave();
        }

        this.client.type = type;
        this.client.join(room);
        cb(null, clients);
    };

    Room.prototype.leave = function () {
        this.parent.io.sockets.in(this.client.room).emit("remove", this.client.id);
        this.client.leave(this.client.room);
        this.client.type = null;
    };

    Room.prototype.disconnect = function () {
        if (this.client.room) {
            this.leave();
        }
    };
    return Room;
})(Connection);

module.exports = Room;
