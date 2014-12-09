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

            mongoose.User.findOne({
                username: username
            }).exec(function (err, user) {
                if (err) {
                    console.log(err);
                }
                if (!user) {
                    user = new mongoose.User({
                        username: username,
                        password: password
                    });
                    user.save();
                }
                if (username === user.username && password === user.password) {
                    if (currentUsers.usersConnected[username]) {
                        currentUsers.usersConnected[username].push(socket.id);
                    } else {
                        currentUsers.usersConnected[username] = [socket.id];
                    }
                    currentUsers.usersBysocketId['user_id' + socket.id] = username;
                    console.log(username + ' logged in.');
                } else {
                    console.log('Invalid username password');
                    user = undefined;
                }
                mongoose.Profile.findOne({
                    username: username
                }).exec(function (err, profile) {
                    if (profile) {
                        profile.presence = 1;
                        profile.save(function (err) {
                            if (!err) {
                                io.sockets.emit('user_presence', 'connect');
                                afterLogin(user, profile);
                            }
                        });
                    } else {
                        var theProfile = new mongoose.Profile({
                            username: user.username,
                            presense: 1
                        });
                        theProfile.save(function (err) {
                            if (!err) {
                                io.sockets.emit('user_presence', 'connect');
                                afterLogin(user, theProfile);
                            }
                        });
                    }
                });
            });
        }
    }
};

io.sockets.on('connection', function (socket) {
    var notifyFriends = function (event, data) {
        mongoose.User.findOne({
            username: currentUsers.usersBysocketId['user_id' + socket.id]
        }).exec(function (err, foundUser) {
            if (foundUser) {
                console.log('in found user');
                foundUser.friends.map(function (friend) {
                    console.log(friend);
                    if (currentUsers.usersConnected[friend.username]) {
                        currentUsers.usersConnected[friend.username].map(function (socketId) {
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
        }).exec(callback);
    };
    currentUsers.allConnections.push(socket.id);
    socket.on('login', function (data, afterLogin) {
        currentUsers.login(data.username, data.password, socket, afterLogin);
    });
    socket.on('new_message', function (data, fn) {
        if (data.from && data.to && data.message) {
            data.fromId = socket.id;
            data.timeStamp = new Date();
            console.log('Send message ' + data.message);
            if (!data.whisper) {
                io.sockets.emit('new_message', data);
            } else {
                data.message = 'Whispered: ' + data.message;
                if (currentUsers.usersConnected[data.to]) {
                    currentUsers.usersConnected[data.to].map(function (userSocket) {
                        socket.to(userSocket).emit('new_message', data);
                    });
                    if (fn) {
                        fn(data);
                    }
                } else {

                    console.log(data.to + ' isn\'t connected');
                }
            }
            data.users = [data.to, data.from];
            new mongoose.ChatMessage(data).save();
        }
    });
    socket.on('update_status', function (profile, callback) {
        console.log('BLurred');
        var username = currentUsers.usersBysocketId['user_id' + socket.id];
        if (username === profile.username) {
            mongoose.updateProfile(profile, notifyFriends, callback);
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
    socket.on('get_chathistory', function (howmany, callback) {
        mongoose.getUserChats(currentUsers.usersBysocketId['user_id' + socket.id],callback);
    });
    socket.on('disconnect', function () {
        currentUsers.allConnections.splice(currentUsers.allConnections.indexOf(socket.id));
        console.log(socket.id + ' Left');
        if (currentUsers.usersBysocketId['user_id' + socket.id]) {
            var socketusername = currentUsers.usersBysocketId['user_id' + socket.id];
            console.log(currentUsers.usersBysocketId['user_id' + socket.id] + ' left.');
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

    socket.on('allusers', function (data) {
        console.log(currentUsers.allConnections.length);
        if (currentUsers.usersConnected[data]) {
            console.log(data + ' is connected ' + currentUsers.usersConnected[data].length + 'times');
        }
    });
});
