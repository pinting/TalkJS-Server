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
    function Room(socket, parent) {
        var _this = this;
        _super.call(this, socket, parent);
        this.socket.type = null;

        ["join", "leave", "disconnect"].forEach(function (method) {
            _this.socket.on(method, _this[method].bind(_this));
        });
    }
    Room.prototype.getRoomClients = function (room) {
        var _this = this;
        var clients = this.parent.io.sockets.clients(room);
        var result = [];

        clients.forEach(function (client) {
            if (_this.socket.id !== client.id) {
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
            this.log("Invalid room name was used by `" + this.socket.id + "`:", room);
            cb("invalidRoom");
            return;
        }
        if (!type) {
            this.log("Invalid room type was used by `" + this.socket.id + "`:", type);
            cb("invalidType");
            return;
        }

        var clients = this.getRoomClients(room);
        for (var id in clients) {
            if (clients[id].id !== this.socket.id && clients[id].type !== type) {
                this.log("Type error by `" + this.socket.id + "`:", type);
                cb("typeError");
                return;
            }
        }

        if (this.socket.room) {
            this.leave();
        }

        this.log("Client `" + this.socket.id + "` has joined to room `" + room + "`");
        this.socket.type = type;
        this.socket.join(room);
        cb(null, clients);
    };

    Room.prototype.leave = function () {
        this.socket.broadcast.to(this.socket.room).emit("remove", this.socket.id);
        this.log("Client `" + this.socket.id + "` has left the room `" + this.socket.room + "`");
        this.socket.leave(this.socket.room);
        this.socket.type = null;
    };

    Room.prototype.disconnect = function () {
        this.log("Client `" + this.socket.id + "` has disconnected");
        this.leave();
    };
    return Room;
})(Connection);

module.exports = Room;
