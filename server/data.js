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

    data.getUseraddFriend = function (socket, username, sendUpdate) {
        data.getCurrentUser(socket.id, function (err, user) {
            if (!err && user) {
                data.addFriend(user, username, sendUpdate);
            }
        });
    };

    data.addFriend = function (dataFromClient, sendUpdate) {
        if (!sendUpdate) {
            sendUpdate = function (dataFromClient) {
                console.log(dataFromClient);
            };
        }
        var canAddFriend = true;
        data.Profile.findOne({
            username: dataFromClient.friend
        }).exec(function (err, userToAdd) {
            if (!err && userToAdd) {
                data.User.findOne(dataFromClient.user).exec(function (err, user) {
                    if (!err && user) {
                        user.deepPopulate('friendsList.friendGroups.friends.profile', function (err) {
                            if (!err) {
                                user.friendsList.friendGroups.map(function (friendGroup) {
                                    friendGroup.friends.map(function (friend) {
                                        var areEqual = friend.profile._id.toString() === userToAdd._id.toString();
                                        if (areEqual) {
                                            canAddFriend = false;
                                        }
                                    });
                                });
                                if (canAddFriend) {
                                    user.friendsList.friendGroups.map(function (friendGroup) {
                                        if (friendGroup.name === 'General') {
                                            friendGroup.friends.push({
                                                profile: userToAdd
                                            });
                                            friendGroup.save(function (err) {
                                                if (!err) {
                                                    sendUpdate(user.friendsList);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    sendUpdate(false);
                                }
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
            connection: socket.id
        }).exec(function (err, profile) {
            if (!err && profile) {
                if (profile.username === status.username) {
                    profile.updateStatus(status.statusMessage, function (profile) {
                        console.log(profile);

                        data.User.findOne({
                            username: profile.username
                        }).exec(function (err, user) {
                            if (!err && user) {
                                data.notifyFriends(user, socket);
                                callback(profile);
                            }
                        });
                    });
                }
            }
        });
    };

    data.sendEventToProfile = function (profileId, event, dataFromClient, socket) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                socket.to(userProfile.connection).emit(event, dataFromClient);
                console.log(dataFromClient);
            }
        });
    };
    data.messageProfile = function (profileId, chatMessage, socket) {
        data.sendEventToProfile(profileId, 'new_message', chatMessage, socket);
    };

    data.sendEventToFriends = function (event, dataToSent, socket) {
        data.getCurrentUser(socket.id, function (err, user) {
            user.deepPopulate('friendsList.friendGroups.friends.profile, profile', function (err) {
                if (!err) {
                    user.friendsList.friendGroups.map(function (friendGroup) {
                        friendGroup.friends.map(function (friend) {
                            socket.to(friend.profile.connection).emit(event, dataToSent);
                        });
                    });
                }
            });
        });
    }

    data.getCurrentUser = function (socketId, callback) {
        data.Profile.findOne({
            connection: socketId
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

                                            callback(user);
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
        data.User.findOne({
            username: userToLogin.username
        }).exec(function (err, user) {
            if (err) {
                console.err(err);
            }
            if (!user) {
                data.makeNewUser(userToLogin, function (user) {
                    user.login(socket, data.notifyFriends, sendToClient);
                });
            } else {
                if (user.password === userToLogin.password) {
                    user.login(socket, data.notifyFriends, sendToClient);
                } else {
                    sendToClient();
                }
            }
        });
    };

    data.notifyFriends = function (user, socket) {
        user.deepPopulate('friendsList.friendGroups.friends.profile, profile', function (err) {
            if (!err) {
                user.friendsList.friendGroups.map(function (friendGroup) {
                    friendGroup.friends.map(function (friend) {
                        socket.to(friend.profile.connection).emit('user_connected', user.profile);
                    });
                });
            }
        });
    };
    data.disconnect = function (socket) {
        data.Profile.findOne({
            connection: socket.id
        }).exec(function (err, profile) {
            if (!err && profile) {
                profile.connection = '';
                profile.presence = 0;
                profile.save(function (err) {
                    if (!err) {
                        data.User.findOne({
                            username: profile.username
                        }).exec(function (err, user) {
                            if (!err && user) {
                                user.deepPopulate('friendsList.friendGroups.friends.profile, profile', function (err) {
                                    if (!err) {
                                        user.friendsList.friendGroups.map(function (friendGroup) {
                                            friendGroup.friends.map(function (friend) {
                                                socket.to(friend.profile.connection).emit('current_status', profile);
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };


    return data;
};

module.exports = new data();
