var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

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
    connection: String
});

module.exports.FriendSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    note: {
        type: String,
        default: 'No note'
    },
    friendStatus: {
        type: Number,
        default: 0 // 0 is you added 1 is mutually added. -1 is ignored/ blocked
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports.FriendGroupSchema = new mongoose.Schema({
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Friend'
        }
    ],
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
    },
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }]

});
module.exports.UserSchema.plugin(deepPopulate /* more on options below */ );

module.exports.NotificationSchema = new mongoose.Schema({
    notificationType: String,
    message: String,
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }
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
module.exports.ChatThreadSchema.plugin(deepPopulate /* more on options below */ );

module.exports.ProfileSchema.methods.updateStatus = function (status, callback) {
    profile = this;
    profile.statusMessage = status;
    profile.presence = profile.presence === 0 ? 1 : profile.presence;
    profile.save(function (err) {
        if (!err && callback) {
            callback(profile);
        }
    });
};


module.exports.UserSchema.methods.login = function (socket, notifyFriends, sendToClient) {
    var user = this;
    user.deepPopulate('friendsList.friendGroups.friends.profile, profile, notifications', function (err) {
        if (!err) {
            user.profile.presence = 1;
            user.profile.connection = socket.id;
            user.profile.save(function (err) {
                if (!err) {
                    notifyFriends(user, socket);
                    sendToClient(user);
                }
            });
        }
    });
};
