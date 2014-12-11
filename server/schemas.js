var mongoose = require('mongoose');

module.exports.ScoreSchema = new mongoose.Schema({
    level: Number,
    score: Number,
    linesCleared: Number,
    singles: Number,
    doubles: Number,
    triples: Number,
    tetrises: Number,
    comboCount: Number,
    lastCleared: Number,
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }
});

module.exports.FriendGroupSchema = new mongoose.Schema({
    friends: [{
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        },
        note: {
            type: String,
            default: 'No note'
        }
    }],
    name: {
        type: String,
        default: 'General'
    }
});

module.exports.FriendListSchema = new mongoose.Schema({
    friendGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendGroup'
    }],
    name: {
        type: String,
        default: 'All'
    }
});


module.exports.UserSchema = new mongoose.Schema({
    username: String,
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    name: {
        first: String,
        last: String
    },
    password: String,
    avatar: String,
    email: String,
    friendsList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendList'
    }

});


module.exports.ProfileSchema = new mongoose.Schema({
    username: String,
    statusMessage: {
        type: String,
        default: 'Online'
    },
    icon: {
        type: String,
        default: 'http://i.imgur.com/APrRDck.png'
    },
    presence: {
        type: Number,
        default: 0
    },
    connections: [{
        type: String,
        default: []
    }]
});

module.exports.ChatMessageSchema = new mongoose.Schema({
    to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
        }],
    from: String,
    message: String,
    timeStamp: Date
});

module.exports.ChatThreadSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
        }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'
        }],
    name: String
});

module.exports.ProfileSchema.methods.updateStatus = function (status, callback) {
    this.statusMessage = status;
    this.save(function (err) {
        if (!err && callback) {
            callback(this);
        }
    });
};


module.exports.UserSchema.methods.login = function (socket, profile, notifyFriends, sendToClient) {
    var user = this;
    profile.presence = 1;
    profile.connections.push(socket.id);
    profile.save(function (err) {
        if (!err) {
            notifyFriends(user, socket);
            sendToClient(user, profile);
        }
    });
};
