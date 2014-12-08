var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {
    usersConnected: [],
    getUserID: function () {

    },
    login: function (username, password, socketId,afterLogin) {
        if (username && password && socketId) {

            mongoose.User.findOne({
                userName: username
            }).exec(function (err, user) {
                if (err) {
                    console.log(err);
                }
                if (!user) {
                    user = new mongoose.User({
                        userName: username,
                        password: password
                    });
                    user.save();
                }
                if (username === user.userName && password === user.password) {
                    if (currentUsers.usersConnected[username]) {
                        currentUsers.usersConnected[username].push(socketId);
                    } else {
                        currentUsers.usersConnected[username] = [socketId];
                    }
                    currentUsers.usersConnected['user_id' + socketId] = username;
                    console.log(username + ' logged in.');
                    console.log(currentUsers.usersConnected[username]);
                } else {
                    console.log('Invalid username password');
                    user = undefined;
                }
                afterLogin(user);
            });
        }
    }
};
io.sockets.on('connection', function (socket) {
    socket.broadcast.emit('New User Connected');
    socket.on('login', function (data,afterLogin) {
        currentUsers.login(data.username, data.password, socket.id,afterLogin);
    });
    socket.on('new_message', function (data,fn) {
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
                if(fn){
                    fn(data);
                }
            } else {

                console.log(data.to + ' isn\'t connected');
            }
        }
        var addToChat = function(thread){
            thread.addMessage(data);
            thread.save();
            console.log("Saved");
            console.log(data);
        }
        //mongoose.getUserChats(data.from,addToChat);
    });

    socket.on('recieved', function (data) {
        socket.to(currentUsers['user_' + data.from]).emit('new message', data);
    });

    socket.on('disconnect', function () {
        console.log(socket.id + ' Left');
        if (currentUsers.usersConnected['user_id' + socket.id]) {
            var socketUsername = currentUsers.usersConnected['user_id' + socket.id];
            var newSocketIds = currentUsers.usersConnected[socketUsername].map(function (socketId) {
                if (socketId !== socket.id) {
                    return socketId;
                } else {

                    return null;
                }
            });
            currentUsers.usersConnected[socketUsername] = newSocketIds;
            currentUsers.usersConnected['user_id' + socket.id] = undefined;
            console.log(currentUsers.usersConnected['user_id' + socket.id] + ' left.');
        }
    });

    socket.on('game', function (data) {
        console.log(data);
    });
});
