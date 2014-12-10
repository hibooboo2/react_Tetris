var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {
    usersConnected: [],
    allConnections: [],
    usersBysocketId: [],
    getUserID: function () {

    },
    login: function (username, password, socket, afterLogin) {
        if (username && password && socket) {
            var addSocketId = function (username, password, user) {
                if (username === user.username && password === user.password) {
                    if (currentUsers.usersConnected[username]) {
                        currentUsers.usersConnected[username].push(socket.id);
                    } else {
                        currentUsers.usersConnected[username] = [socket.id];
                    }
                    currentUsers.usersBysocketId['user_id' + socket.id] = username;
                }
            };
            var findUserProfileUpdate = function (user) {
                if (user !== undefined) {
                    mongoose.Profile.findOne({
                        _id: user.profile
                    }).exec(function (err, profile) {
                        if (profile) {
                            profile.presence = 1;
                            profile.save(function (err) {
                                if (!err) {
                                    user.save(function (err) {
                                        if (!err) {
                                            afterLogin(user, profile);
                                            io.sockets.emit('user_presence', 'connect');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            };
            mongoose.User.findOne({
                username: username
            }).populate('friends.profile').exec(function (err, user) {
                if (err) {
                    console.err(err);
                }
                if (!user) {
                    var newProfile = new mongoose.Profile({
                        username: username
                    });
                    newProfile.save(function (err) {
                        if (!err) {
                            user = new mongoose.User({
                                username: username,
                                password: password,
                                profile: newProfile
                            });
                            user.save(function (err) {
                                if (!err) {
                                    addSocketId(username, password, user);
                                    findUserProfileUpdate(user);
                                }
                            });
                        }
                    });

                } else {
                    addSocketId(username, password, user);
                    findUserProfileUpdate(user);
                }
                /* mongoose.Profile.findOne({
                    username: username
                }).exec(function (err, profile) {
                    if (profile) {
                        profile.presence = 1;
                        profile.save(function (err) {
                            if (!err) {
                                afterLogin(user, profile);
                                io.sockets.emit('user_presence', 'connect');
                            }
                        });
                    } else {
                        var theProfile = new mongoose.Profile({
                            username: user.username,
                            presense: 1
                        });
                        theProfile.save(function (err) {
                            if (!err) {
                                afterLogin(user, theProfile);
                                io.sockets.emit('user_presence', 'connect');
                            }
                        });
                    }
                });*/
            });
        }
    }
};

io.sockets.on('connection', function (socket) {
    var notifyFriends = function (event, data) {
        mongoose.User.findOne({
            username: currentUsers.usersBysocketId['user_id' + socket.id]
        }).populate('friends.profile').exec(function (err, foundUser) {
            if (foundUser) {
                foundUser.friends.map(function (friend) {
                    if (currentUsers.usersConnected[friend.profile.username]) {
                        currentUsers.usersConnected[friend.profile.username].map(function (socketId) {
                            socket.to(socketId).emit(event, data);
                        });
                    }
                });
            }
        });
    };
    var getUser = function (callback) {
        mongoose.User.findOne({
            username: currentUsers.usersBysocketId['user_id' + socket.id]
        }).populate('profile friends.profile').exec(callback);
    };
    currentUsers.allConnections.push(socket.id);
    socket.on('login', function (data, afterLogin) {
        currentUsers.login(data.username, data.password, socket, afterLogin);
    });
    socket.on('new_message', function (chatMessage, fn) {
        if (chatMessage && chatMessage.message) {
            chatMessage.timeStamp = new Date();
            if (!chatMessage.whisper) {
                io.sockets.emit('new_message', chatMessage);
            } else {
                chatMessage.to.map(function (profileId) {
                    mongoose.Profile.findOne({
                        _id: mongoose.ObjectId(profileId)
                    }).exec(function (err, userProfile) {
                        if (!err && userProfile) {
                            console.log('Sending message to: '+userProfile.username);
                            if (currentUsers.usersConnected[userProfile.username]) {
                                console.log(userProfile.username +' is connected.');
                                currentUsers.usersConnected[userProfile.username].map(function (userSocket) {
                                    socket.to(userSocket).emit('new_message', chatMessage);
                                });
                            }
                        }
                    });
                });
            }
            var addMessageToThread = function (chatThread, chatMessage) {
                var theMessage = new mongoose.ChatMessage(chatMessage);
                theMessage.save(function (err) {
                    if (!err) {
                        chatThread.messages.push(theMessage);
                        chatThread.save(function (err) {
                            if (!err) {
                                if (fn) {
                                    fn(theMessage);
                                }
                            }
                        });
                    }
                });
            };
            mongoose.ChatThread.findOne({
                name: chatMessage.to.sort().toString()
            }).populate('messages users').exec(function (err, chatThread) {
                if (!err && !chatThread) {
                    var threadName = chatMessage.to.sort().toString();
                    chatMessage.to = chatMessage.to.map(function (profileId) {
                        return mongoose.ObjectId(profileId);
                    });
                    mongoose.Profile.find().where('_id').in(chatMessage.to).exec(function (err, profiles) {
                        if (!err && profiles.length) {
                            chatThread = new mongoose.ChatThread({
                                users: chatMessage.to,
                                name: threadName
                            });
                            addMessageToThread(chatThread, chatMessage);
                        }
                    });
                } else {
                    chatMessage.to = chatMessage.to.map(function (profileId) {
                        return mongoose.ObjectId(profileId);
                    });
                    addMessageToThread(chatThread, chatMessage);
                }
            });
        }
    });
    socket.on('update_status', function (status, callback) {
        var username = currentUsers.usersBysocketId['user_id' + socket.id];
        if (username === status.username) {
            mongoose.updateStatus(status, notifyFriends, callback);
        }
    });
    socket.on('add_friend', function (friend, sendUpdate) {
        getUser(function (err, user) {
            if (user) {
                if (user.username !== friend.username) {

                    user.addFriend(friend, sendUpdate);
                }
            }
        });
    });
    socket.on('recieved', function (data) {
        socket.to(currentUsers['user_' + data.from]).emit('new message', data);
    });
    socket.on('get_profile', function (username, callback) {
        mongoose.Profile.findOne({
            username: username
        }).exec(callback);
    });
    socket.on('get_chathistory', function (profileId, callback) {
        mongoose.getUserChatThreads(profileId, callback);
    });
    socket.on('disconnect', function () {
        currentUsers.allConnections.splice(currentUsers.allConnections.indexOf(socket.id));
        if (currentUsers.usersBysocketId['user_id' + socket.id]) {
            var socketusername = currentUsers.usersBysocketId['user_id' + socket.id];
            currentUsers.usersConnected.splice(currentUsers.usersConnected.indexOf('user_id' + socket.id), 1);
            currentUsers.usersConnected.splice(currentUsers.usersConnected[socketusername].indexOf(socket.id), 1);
            mongoose.Profile.findOne({
                username: socketusername
            }).exec(function (err, profile) {
                if (profile) {
                    profile.presence = 0;
                    profile.save(function (err) {
                        if (!err) {
                            io.sockets.emit('user_presence', 'disconnect');
                        }
                    });
                }
            });
        }
    });
});
