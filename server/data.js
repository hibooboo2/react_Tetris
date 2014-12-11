var data = function () { // jshint ignore:line

    var mongoose = require('mongoose');
    var schemas = require('./schemas.js');
    var siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris';
    var testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test';
    mongoose.connect(process.env.PORT ? siteDB : testDB);
    var data = {};

    data.db = mongoose.connection;
    data.db.on('error', console.error.bind(console, 'Connection Error: '));

    data.ObjectId = mongoose.Types.ObjectId;

    data.Score = mongoose.model('Score', schemas.ScoreSchema);

    data.Profile = mongoose.model('Profile', schemas.ProfileSchema);

    data.ChatMessage = mongoose.model('ChatMessage', schemas.ChatMessageSchema);

    data.ChatThread = mongoose.model('ChatThread', schemas.ChatThreadSchema);

    data.User = mongoose.model('User', schemas.UserSchema);

    data.getUserChatThreads = function (profileId, callback) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                data.ChatThread.find({
                    users: userProfile._id
                }).populate('messages users').exec(function (err, chatThreads) {
                    if (!err && chatThreads && callback) {
                        callback(chatThreads);
                    }
                });
            }
        });
    };

    data.updateStatus = function (status, socket, callback) {
        data.Profile.findOne({
            connections: socket.id
        }).exec(function (err, profile) {
            if (profile.username === status.username) {
                profile.updateStatus(status.statusMessage, function (profile) {
                    data.User.findOne({
                        username: profile.username
                    }).populate('friends.profile').exec(function (err, user) {
                        if (!err && user) {
                            user.friends.map(function (friend) {
                                friend.connections.map(function (connection) {
                                    socket.to(connection).emit('current_status', profile);
                                });
                            });
                        }
                    });
                    callback(profile);
                });
            }
        });
    };

    data.messageProfile = function (profileId, chatMessage, socket) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                userProfile.connections.map(function (userSocket) {
                    socket.to(userSocket).emit('new_message', chatMessage);
                });
            }
        });
    };

    data.getCurrentUser = function (socketId, callback) {
        data.Profile.findOne({
            connections: socketId
        }).exec(function (err, profile) {
            if (!err && profile) {
                data.User.findOne({
                    profile: profile
                }).exec(callback);
            }
        });
    };

    data.login = function (userToLogin, afterLogin, socket) {
        data.User.findOne(userToLogin).populate('friends.profile profile').exec(function (err, user) {
            if (err) {
                console.err(err);
            }
            if (!user) {
                var newProfile = new data.Profile({
                    username: userToLogin.username
                });
                newProfile.save(function (err) {
                    if (!err) {
                        user = new data.User({
                            username: userToLogin.username,
                            password: userToLogin.password,
                            profile: newProfile
                        });
                        user.save(function (err) {
                            if (!err) {
                                user.login(socket, newProfile, afterLogin);
                            }
                        });
                    }
                });

            } else {
                user.login(socket, user.profile, afterLogin);
            }
        });
    };

    data.disconnect = function (socket) {
        data.Profile.findOne({
            connections: socket.id
        }).exec(function (err, profile) {
            if (!err && profile) {
                var connIndex = profile.connections.indexOf(socket.id)
                if (connIndex !== -1) {
                    profile.connections.splice(connIndex, 1);
                    profile.presence = profile.connections.length > 0 ? 1 : 0;
                    profile.save(function (err) {
                        if (!err) {
                            data.User.findOne({
                                username: profile.username
                            }).populate('friends.profile').exec(function (err, user) {
                                if (!err && user) {
                                    user.friends.map(function (friend) {
                                        friend.profile.connections.map(function (connection) {
                                            socket.to(connection).emit('current_status', profile);
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    }


    return data;
};

module.exports = new data();
