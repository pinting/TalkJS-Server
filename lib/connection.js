var Helpers = require("./utils/helpers");

function Connection(client, parent) {
    var self = this;
    this.parent = parent;
    this.client = client;
    this.client.loggedIn = false;
    this.client.username = null;
    this.client.friends = [];
    this.client.type = null;
    this.client.room = null;
    [
        "registerUser",
        "getFriends",
        "createRoom",
        "logoutUser",
        "addFriend",
        "delFriend",
        "leaveRoom",
        "loginUser",
        "joinRoom",
        "message",
    ].forEach(function(method) {
        self.client.on(method, self[method].bind(self));
    });
}

/**
 * Push friends to the database
 * @cb {function}
 */

Connection.prototype._pushFriends = function(cb) {
    cb = Helpers.safeCb(cb);

    this.parent.database.run("UPDATE Users SET Friends = $friends WHERE Name = $name", {
        $name: this.client.username,
        $friends: this.client.friends.join(",")
    }, function(error) {
        if(!Helpers.isNone(error)) {
            console.error(error);
            cb("error");
            return;
        }
        cb(null);
    });
};

/**
 * Get an array describing the room clients
 * @name {string}
 */

Connection.prototype._roomClients = function(name) {
    var clients = this.parent.io.sockets.clients(name);
    var result = {};
    var self = this;

    clients.forEach(function(client) {
        if(self.client.id !== client.id) {
            result[client.id] = {
                username: client.username,
                type: client.type
            };
        }
    });
    return result;
};

/**
 * Get a list of online and offline friends
 * @cb {function}
 */

Connection.prototype.getFriends = function(cb) {
    cb = Helpers.safeCb(cb);

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }

    var offline = this.client.friends.slice(0);
    var clients = this.parent.io.sockets.clients();
    var online = {};
    var index;

    clients.forEach(function(client) {
        index = offline.indexOf(client.username);
        if(client.loggedIn && index >= 0) {
            online[client.id] = {username: client.username};
            offline.splice(index, 1);
        }
    });
    console.log(this.parent.io.sockets.clients());
    console.log(online, offline);
    cb(null, online, offline);
};

/**
 * Add a new friend to the list
 * @username {string}
 * @cb {function}
 */

Connection.prototype.addFriend = function(username, cb) {
    username = Helpers.safeStr(username);
    cb = Helpers.safeCb(cb);

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }
    if(!Helpers.isString(username)) {
        cb("args");
        return;
    }

    var self = this;
    this.parent.database.get("SELECT Name FROM Users WHERE Name = username", {
        $username: username
    }, function(error, row) {
        if(!Helpers.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Helpers.isObject(row) || !Helpers.isString(row.Name) || username === self.client.username) {
            cb("notFound");
            return;
        }
        if(Helpers.find(self.client.friends, username)) {
            cb("exists");
            return;
        }
        self.client.friends.push(username);
        self._pushFriends(cb);
        cb(null);
    });
};

/**
 * Delete friend from list
 * @username {string}
 * @cb {function}
 */

Connection.prototype.delFriend = function(username, cb) {
    cb = Helpers.safeCb(cb);
    var index;

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }
    if(!Helpers.isString(username)) {
        cb("args");
        return;
    }
    if(index = this.client.friends.indexOf(Helpers.safeStr(username)) < 0) {
        cb("notFound");
        return;
    }

    this.client.friends.splice(index, 1);
    this._pushFriends(cb);
    cb(null);
};

/**
 * Join to a room
 * @room {object}
 * @cb {function}
 */

Connection.prototype.joinRoom = function(room, cb) {
    room = {
        username: this.client.loggedIn ? this.client.username || Helpers.safeStr(room.username) : Helpers.safeStr(room.username),
        type: Helpers.find(["audio", "video", "data"], room.type) ? room.type : "",
        name: Helpers.safeStr(room.name)
    };
    cb = Helpers.safeCb(cb);

    if(!Helpers.isString(room.username) || !Helpers.isString(room.name) || !Helpers.isString(room.type)) {
        cb("args");
        return;
    }

    var clients = this.parent.io.sockets.clients(room.name);
    var client;
    var id;

    for(id in clients) {
        client = clients[id];
        if(client.type !== room.type && this.client.id !== client.id) {
            cb("typeError");
            return;
        }
    }

    if(this.client.room) {
        this.leaveRoom();
    }

    cb(null, this._roomClients(room.name));

    this.client.join(room.name);
    this.client.room = room.name;
    this.client.username = room.username;
    this.client.type = room.type;
};

/**
 * Create a room if it is not exists
 * @room {object}
 * @cb {function}
 */

Connection.prototype.createRoom = function(room, cb) {
    cb = Helpers.safeCb(cb);

    if(!Helpers.isObject(room) || !Helpers.isString(room.name = Helpers.safeStr(room.name))) {
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

Connection.prototype.leaveRoom = function() {
    this.parent.io.sockets.in(this.client.room).emit("remove", {
        type: this.client.type,
        id: this.client.id
    });
    if(!this.client.loggedIn) {
        this.client.username = null;
    }
    this.client.type = null;
    this.client.room = null;
};

/**
 * Register a new account
 * @username {string}
 * @password {string}
 * @cb {function}
 */

Connection.prototype.registerUser = function(username, password, cb) {
    username = Helpers.safeStr(username);
    cb = Helpers.safeCb(cb);

    if(!Helpers.isString(username) || !Helpers.isString(password)) {
        cb("args");
        return;
    }

    var self = this;
    this.parent.database.get("SELECT Name FROM Users WHERE Name = $username", {
        $username: username
    }, function(error, row) {
        if(!Helpers.isNone(error)) {
            console.error(error);
            return;
        }
        if(Helpers.isObject(row) && Helpers.isString(row.Name)) {
            cb("exists");
            return;
        }
        self.parent.database.run("INSERT INTO Users VALUES ($username, $password, '')", {
            $username: username,
            $password: Helpers.sha256(password)
        }, function(error) {
            if(!Helpers.isNone(error)) {
                console.error(error);
                cb("error");
                return;
            }
            cb(null);
        });
    });
};

/**
 * Log in to an account
 * @username {string}
 * @password {string}
 * @cb {function}
 */

Connection.prototype.loginUser = function(username, password, cb) {
    username = Helpers.safeStr(username);
    cb = Helpers.safeCb(cb);

    if(!Helpers.isString(username) || !Helpers.isString(password)) {
        cb("args");
        return;
    }

    var self = this;
    this.parent.database.get("SELECT Name, Friends FROM Users WHERE Name = $username AND Pass = $password", {
        $username: username,
        $password: Helpers.sha256(password)
    }, function(error, row) {
        if(!Helpers.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Helpers.isObject(row) || !Helpers.isString(row.Name)) {
            cb("notFound");
            return;
        }
        if(Helpers.isString(row.Friends)) {
            self.client.friends = row.Friends.split(",");
        }
        self.client.loggedIn = true;
        self.client.username = username;
        cb(null);
    });
};

/**
 * Log out from an account
 */

Connection.prototype.logoutUser = function() {
    this.client.loggedIn = false;
    this.client.friends = [];
};

/**
 * Send a message to someone else
 * @message {object}
 */

Connection.prototype.message = function(type, message) {
    var peers = this.parent.io.sockets.sockets[message.to];
    if(Helpers.isObject(peers)) {
        message.from = this.client.id;
        peers.emit("message", type, message);
    }
};

module.exports = Connection;