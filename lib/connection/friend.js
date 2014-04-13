var RoomConnection = require("./room");
var Util = require("../util");

function FriendConnection(client, parent) {
    RoomConnection.call(this, client, parent);

    var self = this;
    this.client.friends = [];

    ["registerUser", "getFriends", "logoutUser", "addFriend", "delFriend", "loginUser"].forEach(function(method) {
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

    this.parent.database.run("UPDATE Users SET Friends = $friends WHERE Name = $name", {
        $name: this.client.username,
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
 * Get a list of online and offline friends
 * @cb {function}
 */

FriendConnection.prototype.getFriends = function(cb) {
    cb = Util.safeCb(cb);

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
    this.parent.database.get("SELECT Name FROM Users WHERE Name = username", {
        $username: username
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Util.isObject(row) || !Util.isString(row.Name) || username === self.client.username) {
            cb("notFound");
            return;
        }
        if(Util.find(self.client.friends, username)) {
            cb("exists");
            return;
        }
        self.client.friends.push(username);
        self._pushFriends(cb);
        cb(null);
    });
};

/**
 * Delete friend from the list
 * @username {string}
 * @cb {function}
 */

FriendConnection.prototype.delFriend = function(username, cb) {
    cb = Util.safeCb(cb);
    var index;

    if(!this.client.loggedIn) {
        cb("notLoggedIn");
        return;
    }
    if(!Util.isString(username)) {
        cb("args");
        return;
    }
    if(index = this.client.friends.indexOf(Util.safeStr(username)) < 0) {
        cb("notFound");
        return;
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
    this.parent.database.get("SELECT Name FROM Users WHERE Name = $username", {
        $username: username
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(Util.isObject(row) && Util.isString(row.Name)) {
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
    this.parent.database.get("SELECT Name, Friends FROM Users WHERE Name = $username AND Pass = $password", {
        $username: username,
        $password: Util.sha256(password)
    }, function(error, row) {
        if(!Util.isNone(error)) {
            console.error(error);
            return;
        }
        if(!Util.isObject(row) || !Util.isString(row.Name)) {
            cb("notFound");
            return;
        }
        if(Util.isString(row.Friends)) {
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

FriendConnection.prototype.logoutUser = function() {
    this.client.loggedIn = false;
    this.client.friends = [];
};

module.exports = FriendConnection;