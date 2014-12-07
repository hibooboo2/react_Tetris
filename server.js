var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    data = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {
    usersConnected: [],
    getUserID: function () {

    },
    login: function (username, password, socketId) {
        if (username && password && socketId) {

            data.User.findOne({
                userName: username
            }).exec(function (err, user) {
                if (err) {
                    console.log(err);
                }
                if (!user) {
                    user = new data.User({
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
                }
                //currentUsers.usersConnected[user.userName]
            });
        }
    }
};
io.sockets.on('connection', function (socket) {
    socket.broadcast.emit('New User Connected');
    socket.on('login', function (data) {
        currentUsers.login(data.username, data.password, socket.id);
    });
    socket.on('test',function(w,x,y,z){
        w.timeStamp = new Date();
        console.log('w');
        console.log(w);
        console.log('x');
        console.log(x);
        x(w);
        console.log('y');
        console.log(y);
        console.log('z');
        console.log(z);
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
