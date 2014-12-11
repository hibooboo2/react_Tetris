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
    friends: [{
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        },
        note: {
            type: String,
            default: ' '
        },
        group: {
            type: String,
            default: 'General'
        }
        }]
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
    connections: [String]
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


module.exports.UserSchema.methods.addFriend = function (friend, sendUpdate) {
    var currentUser = this;
    module.exports.Profile.findOne({
        username: friend.username
    }).exec(function (err, profile) {
        if (!err && profile) {
            var hasFriend = currentUser.friends.filter(function (friend) {
                return friend.profile.username === profile.username;
            }).length > 0;
            if (!hasFriend) {
                currentUser.friends.push({
                    profile: profile
                });
                var friends = currentUser.friends;
                currentUser.save(function (err) {
                    if (!err) {
                        sendUpdate(friends);
                    }
                });
            }
        }
    });

};

module.exports.ProfileSchema.methods.updateStatus = function (status, callback) {
    this.statusMessage = status;
    this.save(function (err) {
        if (!err && callback) {
            callback(this);
        }
    });
};
