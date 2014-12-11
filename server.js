var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));

io.sockets.on('connection', function (socket) {
    socket.on('login', function (user, afterLogin) {
        mongoose.login(user, afterLogin, socket);
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
                mongoose.messageProfile(profileId, chatMessage, socket);
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
        mongoose.updateStatus(status, socket, callback);
    });
    socket.on('add_friend', function (friend, sendUpdate) {
        mongoose.getCurrentUser(socket.id, function (err, user) {
            if (user) {
                if (user.username !== friend.username) {
                    mongoose.Profile.findOne({
                        username: friend.username
                    }).exec(function (err, profile) {
                        if (!err && profile) {
                            user.addFriend(friend, profile, sendUpdate);
                        }
                    });
                }
            }
        });
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
        mongoose.disconnect(socket);
    });
});
