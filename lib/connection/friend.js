var RoomConnection = require("./room");
var Util = require("../util");

function FriendConnection(client, parent) {
    RoomConnection.call(this, client, parent);

    var self = this;
    this.client.friends = [];

    ["registerUser", "logoutUser", "addFriend", "delFriend", "loginUser"].forEach(function(method) {
        self.client.on(method, self[method].bind(self));
    });
}

Util.inherits(FriendConnection, RoomConnection);

/**
 * Push friends to the database
 * @cb {function}
 */

FriendConnection.prototype._pushFriends = function(cb) {
    cb = Util.safeCb(cb);

    this.parent.database.run("UPDATE Users SET Friends = $friends WHERE Username = $username", {
        $username: this.client.username,
        $friends: this.client.friends.join(",")
    }, function(error) {
        if(!Util.isNone(error)) {
            console.error(error);
            cb("error");
            return;
        }
        cb(null);
    });
};

/**
 * Send friends a message
 * @payload {string}
 */

FriendConnection.prototype._tellFriends = function(payload) {
    var clients = this.parent.io.sockets.clients();
    var self = this;

    clients.forEach(function(client) {
        self._tellFriend(client, payload);
    });

};

/**
 * Send friends a message
 * @payload {string}
 */

FriendConnection.prototype._tellFriend = function(client, payload) {
    if(client.loggedIn && Util.find(this.client.friends, client.username) && Util.find(client.friends, this.client.username)) {
        this.parent.io.sockets.sockets[client.id].emit(payload, {
            username: this.client.username,
            type: this.client.type,
            id: this.client.id
        });
    }
};

/**
 * Get a friend by its username
 * @username {string}
 */

FriendConnection.prototype._getFriendByName = function(username) {
    var clients = this.parent.io.sockets.clients();
    var result = [];
    var self = this;

    clients.every(function(client) {
        if(client.loggedIn && client.username === username && Util.find(self.client.friends, client.username) && Util.find(client.friends, self.client.username)) {
            result.push(client);
            return false;
        }
        return true;
    });
    return result;
};

/**
 * Add a new friend to the list
 * @username {string}
 * @cb {function}
 */

FriendConnection.prototype.addFriend = function(username, cb) {
    username = Util.safeStr(username);
    cb = Util.safeCb(cb);

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }
    if(!Util.isString(username)) {
        cb("args");
        return;
    }

    var self = this;
    var client;

    this.parent.database.get("SELECT Username FROM Users WHERE Username = $username", {
        $username: username
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Util.isObject(row) || !Util.isString(row.Username) || username === self.client.username) {
            cb("notFound");
            return;
        }
        if(Util.find(self.client.friends, username)) {
            cb("exists");
            return;
        }

        self.client.friends.push(username);
        self._pushFriends(cb);

        if(!Util.isEmpty(client = self._getFriendByName(username))) {
            self._tellFriend(client[0], "online");
        }

        cb(null);
    });
};

/**
 * Delete friend from the list
 * @username {string}
 * @cb {function}
 */

FriendConnection.prototype.delFriend = function(username, cb) {
    username = Util.safeStr(username);
    cb = Util.safeCb(cb);

    var client;
    var index;

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }
    if(!Util.isString(username)) {
        cb("args");
        return;
    }
    if(index = this.client.friends.indexOf(username) < 0) {
        cb("notFound");
        return;
    }

    if(!Util.isEmpty(client = this._getFriendByName(username))) {
        this._tellFriend(client[0], "offline");
    }

    this.client.friends.splice(index, 1);
    this._pushFriends(cb);

    cb(null);
};

/**
 * Register a new account
 * @username {string}
 * @password {string}
 * @cb {function}
 */

FriendConnection.prototype.registerUser = function(username, password, cb) {
    username = Util.safeStr(username);
    cb = Util.safeCb(cb);

    if(!Util.isString(username) || !Util.isString(password)) {
        cb("args");
        return;
    }

    var self = this;
    this.parent.database.get("SELECT Username FROM Users WHERE Username = $username", {
        $username: username
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(Util.isObject(row) && Util.isString(row.Username)) {
            cb("exists");
            return;
        }
        self.parent.database.run("INSERT INTO Users VALUES ($username, $password, '')", {
            $username: username,
            $password: Util.sha256(password)
        }, function(error) {
            if(!Util.isNone(error)) {
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

FriendConnection.prototype.loginUser = function(username, password, cb) {
    username = Util.safeStr(username);
    cb = Util.safeCb(cb);

    if(!Util.isString(username) || !Util.isString(password)) {
        cb("args");
        return;
    }

    var self = this;
    this.parent.database.get("SELECT Username, Friends FROM Users WHERE Username = $username AND Password = $password", {
        $username: username,
        $password: Util.sha256(password)
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Util.isObject(row) || !Util.isString(row.Username)) {
            cb("notFound");
            return;
        }

        self.client.loggedIn = true;
        self.client.username = username;

        if(Util.isString(row.Friends)) {
            self.client.friends = row.Friends.split(",");
            self._tellFriends("online");
        }

        cb(null);
    });
};

/**
 * Log out from an account
 */

FriendConnection.prototype.logoutUser = function() {
    this._tellFriends("offline");
    this.client.loggedIn = false;
    this.client.friends = [];
};

/**
 * On disconnect
 */

FriendConnection.prototype.disconnect = function() {
    this.logoutUser();
    this.leaveRoom();
};

module.exports = FriendConnection;