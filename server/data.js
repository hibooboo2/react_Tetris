var data = function () { // jshint ignore:line
    'use strict';
    var mongoose = require('mongoose'),
        schemas = require('./schemas.js'),
        siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris',
        //        testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test',
        dockerDB = 'mongodb://mongo:27017/',
        dbToUse = process.env.PORT ? siteDB : dockerDB,
        data = {};
    mongoose.connect(dbToUse);

    data.db = mongoose.connection;
    data.db.on('error', console.error.bind(console, 'Connection Error: '));
    if (dbToUse === dockerDB) {

    }
    data.ObjectId = mongoose.Types.ObjectId;


    data.Friend = mongoose.model('Friend', schemas.FriendSchema);
    data.Score = mongoose.model('Score', schemas.ScoreSchema);

    data.Profile = mongoose.model('Profile', schemas.ProfileSchema);

    data.ChatMessage = mongoose.model('ChatMessage', schemas.ChatMessageSchema);

    data.ChatThread = mongoose.model('ChatThread', schemas.ChatThreadSchema);

    data.User = mongoose.model('User', schemas.UserSchema);
    data.FriendGroup = mongoose.model('FriendGroup', schemas.FriendGroupSchema);
    data.FriendList = mongoose.model('FriendList', schemas.FriendListSchema);
    data.Notification = mongoose.model('Notification', schemas.NotificationSchema);

    data.sendFriendRequest = function (dataFromClient, sendUpdate, socket) {
        console.log('Called Send request');
        //create friend. if profile exists.
        data.Profile.findOne({
            username: dataFromClient.friend
        }).exec(function (err, profileFound) {
            if (!err && profileFound) {
                console.log('Found Profile');
                data.Friend.findOne({
                    owner: data.ObjectId(dataFromClient.user._id),
                    profile: profileFound._id
                }).exec(function (err, friend) {
                    if (!err && friend) {
                        console.log('Sent Update Already Friend');
                        sendUpdate({
                            message: dataFromClient.friend + ' is alread your friend.',
                            notificationType: 'Add Friend Error'
                        });
                    } else if (!err && !friend) {
                        console.log('Making new Friend.');
                        var newFriend = new data.Friend({
                            owner: data.ObjectId(dataFromClient.user._id),
                            profile: profileFound._id,
                            friendStatus: 0
                        });
                        newFriend.save(function (err) {
                            if (!err) {
                                data.User.findOne({
                                    _id: data.ObjectId(dataFromClient.user._id)
                                }).exec(
                                    function (err, user) {
                                        if (!err && user) {
                                            user.deepPopulate('friendsList.friendGroups.friends.profile, profile', function (err) {
                                                if (!err) {
                                                    user.friendsList.friendGroups = user.friendsList.friendGroups.map(function (friendGroup) {
                                                        if (friendGroup.name === 'General') {
                                                            console.log('Pushing friend to friendgroup');
                                                            friendGroup.friends.push(newFriend);
                                                        }
                                                        console.log('Saving friend Group');
                                                        friendGroup.save();
                                                        return friendGroup;
                                                    });

                                                    user.save(function (err) {
                                                        if (!err) {
                                                            console.log('Creating notification');
                                                            var newNotification = new data.Notification({
                                                                message: user.profile.username + ' has sent you a friend request.',
                                                                notificationType: 'Friend Request',
                                                                to: newFriend.profile,
                                                                from: newFriend.owner
                                                            });
                                                            newNotification.save(function (err) {
                                                                if (!err) {
                                                                    console.log('Notification saved');
                                                                    data.User.findOne({
                                                                        profile: newFriend.profile
                                                                    }).exec(function (err, user) {
                                                                        console.log('In Exec for finding user.');
                                                                        if (!err && user) {
                                                                            console.log('Notification pushed to user');
                                                                            user.notifications.push(newNotification);
                                                                            user.save(function (err) {
                                                                                if (!err) {
                                                                                    console.log('Notifications saved to user.');
                                                                                    data.sendEventToProfile(user.profile, 'notification', newNotification, socket);
                                                                                    sendUpdate({
                                                                                        message: dataFromClient.friend + ' has been sent a friend request.',
                                                                                        notificationType: 'Friend Request Sent'
                                                                                    });
                                                                                    console.log('Updates sent.')
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });

                                        }
                                    });

                            }
                        });
                    }
                });
            } else if (!err && !profileFound) {
                console.log('Profile Not Found');
                sendUpdate({
                    message: dataFromClient.friend + ' does not exist. Verify the name and try again.',
                    notificationType: 'Add Friend Error'
                });
            }
        });
    };

    data.acceptFriendRequest = function (friendRequest, socket) {

    };

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

    data.sendEventToFriends = function (event, dataToSend, socket) {
        data.getCurrentUser(socket.id, function (err, user) {
            user.deepPopulate('friendsList.friendGroups.friends.profile, profile', function (err) {
                if (!err) {
                    user.friendsList.friendGroups.map(function (friendGroup) {
                        friendGroup.friends.map(function (friend) {
                            socket.to(friend.profile.connection).emit(event, dataToSend);
                        });
                    });
                }
            });
        });
    };

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
