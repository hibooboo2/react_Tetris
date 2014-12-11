var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {
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
                    io.sockets.emit('user_presence', 'connect');
                    return true;
                } else {
                    return false;
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
                                            if (addSocketId(username, password, user)) {
                                                afterLogin(user, profile);

                                            } else {
                                                afterLogin();
                                            }
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
            }).populate('friends.profile profile').exec(function (err, user) {
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
                                    findUserProfileUpdate(user);
                                }
                            });
                        }
                    });

                } else {
                    findUserProfileUpdate(user);
                }
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
    socket.on('get_thread', function (threadName, addThread) {
        mongoose.ChatThread.findOne({
            name: threadName
        }).populate('users messages').exec(function (err, thread) {
            if (!err && thread) {
                addThread(thread);
            }
        });
    });
    socket.on('new_message', function (chatMessage, fn) {
        if (chatMessage && chatMessage.message) {
            chatMessage.timeStamp = new Date();
        chatMessage.to.map(function (profileId) {
            mongoose.messageProfile(profileId,chatMessage,socket);
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
