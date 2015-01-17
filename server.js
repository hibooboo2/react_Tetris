var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));

io.sockets.on('connection', function (socket) {
    socket.on('login', function (user, sendToClient) {
        if (user && sendToClient) {
            mongoose.login(user, socket, sendToClient);
            // putAllOther socket.ons in here. This makes u have to logon.
        }
    });
    socket.on('get_thread', function (threadName, addThread) {
        mongoose.ChatThread.findOne({
            name: threadName
        }).populate('users messages').exec(function (err, foundThread) {
            if (!err && foundThread) {
                addThread(foundThread);
                console.log(foundThread);
            }
        });
    });
    socket.on('new_chatThread', function (thread, addThread) {
        mongoose.ChatThread.findOne({
            name: thread.name
        }).populate('users messages').exec(function (err, foundThread) {
            if (!err && !foundThread) {

                thread.users = thread.users.map(function (id) {
                    console.log(mongoose.ObjectId(id));
                    return mongoose.ObjectId(id);
                });
                var newThread = new mongoose.ChatThread(thread);
                newThread.save(function (err) {
                    if (!err) {
                        newThread.deepPopulate('users', function (err) {
                            if (!err) {
                                mongoose.sendEventToFriends('new_thread', newThread, socket);
                                addThread(newThread);
                                console.log(newThread);
                            }
                        });
                    }
                });
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
    socket.on('send_FriendRequest', function (data, sendUpdate) {
        console.log(data);
        mongoose.sendFriendRequest(data, sendUpdate,socket);
    });
    socket.on('decline_FriendRequest', function (data, sendUpdate) {
        console.log(data);
        mongoose.declineFriendRequest(data, sendUpdate);
    });
    socket.on('accept_FriendRequest', function (data, sendUpdate) {
        console.log(data);
        mongoose.acceptFriendRequest(data, sendUpdate);
    });
    socket.on('get_profile', function (profileId, callback) {
        mongoose.Profile.findOne({
            _id: mongoose.ObjectId(profileId._id ? profileId._id : profileId)
        }).exec(callback);
    });
    socket.on('get_chathistory', function (profileId, callback) {
        mongoose.getUserChatThreads(profileId, callback);
    });
    socket.on('disconnect', function () {
        mongoose.disconnect(socket);
    });
});
