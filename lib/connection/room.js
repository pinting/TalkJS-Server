var Util = require("../util");

function RoomConnection(client, parent) {
    var self = this;
    this.parent = parent;
    this.client = client;
    this.client.loggedIn = false;
    this.client.username = null;
    this.client.roomType = null;
    this.client.room = null;

    ["createRoom", "leaveRoom", "joinRoom", "message", "disconnect"].forEach(function(method) {
        self.client.on(method, self[method].bind(self));
    });
}

/**
 * Get an array of room clients
 * @name {string}
 */

RoomConnection.prototype._roomClients = function(name) {
    var clients = this.parent.io.sockets.clients(name);
    var result = {};
    var self = this;

    clients.forEach(function(client) {
        if(self.client.id !== client.id) {
            result[client.id] = {
                username: client.username,
                type: client.roomType
            };
        }
    });
    return result;
};

/**
 * Join to a room
 * @room {object}
 * @cb {function}
 */

RoomConnection.prototype.joinRoom = function(room, cb) {
    room = {
        username: this.client.loggedIn ? this.client.username || Util.safeStr(room.username) : Util.safeStr(room.username),
        type: Util.find(["audio", "video", "data"], room.type) ? room.type : "",
        name: Util.safeStr(room.name)
    };
    cb = Util.safeCb(cb);

    if(!Util.isString(room.username) || !Util.isString(room.name) || !Util.isString(room.type)) {
        cb("args");
        return;
    }

    var clients = this.parent.io.sockets.clients(room.name);
    var client;
    var id;

    for(id in clients) {
        client = clients[id];
        if(client.roomType !== room.type && this.client.id !== client.id) {
            cb("typeError");
            return;
        }
    }

    if(this.client.room) {
        this.leaveRoom();
    }

    this.client.username = room.username;
    this.client.roomType = room.type;
    this.client.room = room.name;
    this.client.join(room.name);

    cb(null, this._roomClients(room.name));
};

/**
 * Create a room if it is not exists
 * @room {object}
 * @cb {function}
 */

RoomConnection.prototype.createRoom = function(room, cb) {
    cb = Util.safeCb(cb);

    if(!Util.isObject(room) || !Util.isString(room.name = Util.safeStr(room.name))) {
        cb("args");
        return;
    }
    if(this.parent.io.sockets.clients(room.name).length) {
        cb("roomExists");
        return;
    }
    this.joinRoom(room, cb);
};

/**
 * Leave the current room
 */

RoomConnection.prototype.leaveRoom = function() {
    this.parent.io.sockets.in(this.client.room).emit("remove", {
        type: this.client.roomType,
        id: this.client.id
    });
    if(!this.client.loggedIn) {
        this.client.username = null;
    }
    this.client.leave(this.client.room);
    this.client.roomType = null;
    this.client.room = null;
};

/**
 * Send a message to someone else
 * @message {object}
 */

RoomConnection.prototype.message = function(type, message) {
    var client = this.parent.io.sockets.sockets[message.to];

    if(Util.isObject(client)) {
        message.from = this.client.id;
        client.emit("message", type, message);
    }
};

/**
 * On disconnect
 */

RoomConnection.prototype.disconnect = function() {
    this.leaveRoom();
};

module.exports = RoomConnection;