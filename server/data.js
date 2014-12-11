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

    data.addFriend = function (socket, username, sendUpdate) {
        data.getCurrentUser(socket.id, function (err, user) {
            var canAddFriend = true;
            // get profile and wrap this.
            data.Profile.findOne({
                username: username
            }).exec(function (err, userToAdd) {
                if (!err && userToAdd) {
                    data.FriendList.findOne({
                        _id: data.ObjectId(user.friendsList)
                    }).populate('friendGroups').exec(function (err, friendList) {
                        friendList.friendGroups.map(function (friendGroup) {
                            console.log('Friend Group: ' + friendGroup.name);
                            friendGroup.friends.map(function (friend) {
                                console.log(friend.profile);
                                if (friend.profile === userToAdd._id) {
                                    console.log('Has Friend');
                                    canAddFriend = false;
                                }
                            });
                        });
                        if (canAddFriend) {
                            friendList.friendGroups.map(function (friendGroup) {
                                if (friendGroup.name === 'General') {
                                    friendGroup.friends.push(userToAdd._id);
                                    friendGroup.save(function (err) {
                                        if (!err) {
                                            sendUpdate(true);
                                        }
                                    });
                                }
                            });
                        } else {
                            sendUpdate(false);
                        }
                    });
                } else {
                    sendUpdate(false);
                }
            });
        });
    };

    data.Score = mongoose.model('Score', schemas.ScoreSchema);

    data.Profile = mongoose.model('Profile', schemas.ProfileSchema);

    data.ChatMessage = mongoose.model('ChatMessage', schemas.ChatMessageSchema);

    data.ChatThread = mongoose.model('ChatThread', schemas.ChatThreadSchema);

    data.User = mongoose.model('User', schemas.UserSchema);
    data.FriendGroup = mongoose.model('FriendGroup', schemas.FriendGroupSchema);
    data.FriendList = mongoose.model('FriendList', schemas.FriendListSchema);

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

    data.sendEventToProfile = function (profileId, event, data, socket) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                userProfile.connections.map(function (userSocket) {
                    socket.to(userSocket).emit(event, data);
                });
            }
        });
    };
    data.messageProfile = function (profileId, chatMessage, socket) {
        data.sendEventToProfile(profileId, 'new_message', chatMessage, socket);
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

    data.makeNewUser = function (userToMake, callback) {
        var newProfile = new data.Profile({
            username: userToMake.username
        });
        newProfile.save(function (err) {
            if (!err) {
                var newFriendGroup = new data.FriendGroup({});
                newFriendGroup.save(function (err) {
                    if (!err) {
                        var newFriendList = new data.FriendList({
                            friendGroups: [newFriendGroup]
                        });
                        newFriendList.save(function (err) {
                            if (!err) {
                                var user = new data.User({
                                    username: userToMake.username,
                                    password: userToMake.password,
                                    profile: newProfile,
                                    friendsList: newFriendList
                                });
                                user.save(function (err) {
                                    if (!err) {
                                        if (callback) {
                                            callback(user, newProfile);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };

    data.login = function (userToLogin, socket, sendToClient) {
        data.User.findOne({username:userToLogin.username}).populate('friends.profile profile').exec(function (err, user) {
            if (err) {
                console.err(err);
            }
            if (!user) {
                data.makeNewUser(userToLogin, function (user, newProfile) {
                    user.login(socket, newProfile, data.notifyFriends, sendToClient);
                });
            } else {
                if(user.password ===userToLogin.password){
                    user.login(socket, user.profile, data.notifyFriends, sendToClient);
                }else{
                    sendToClient();
                }
            }
        });
    };

    data.notifyFriends = function (user, socket) {
        console.log(user);
        socket.emit('user_connected', user.profile);
        //get all user friends profiles and send them a message.
        //        user.friends.map(function (friend) {
        //            friend.profile.connections.map(function (connection) {
        //                socket.to(connection).emit('user_connected', user.profile);
        //            });
        //        });
    };
    data.disconnect = function (socket) {
        data.Profile.findOne({
            connections: 'fuck'
        }).exec(function (err, profile) {
            if (!err && profile) {
                var connIndex = profile.connections.indexOf(socket.id);
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
    };


    return data;
};

module.exports = new data();
