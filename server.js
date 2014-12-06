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

    }
};
io.sockets.on('connection', function (socket) {
    socket.broadcast.emit('New User Connected');
    socket.on('login', function (data) {
        currentUsers['user_' + data.name] = socket.id;
        console.log('Logged IN! ' + data.name);
    });
    socket.on('new_message', function (data) {
        console.log(currentUsers);
        data.fromId = socket.id;
        data.timeStamp = new Date();
        console.log('Send message ' + data.message);
        if (!data.whisper) {
            io.sockets.emit('new_message', data);
        } else {
            data.message = "Whispered: " + data.message;
            console.log(currentUsers['user_' + data.to]);
            socket.to(currentUsers['user_' + data.to]).emit('new_message', data);
        }
    });

    socket.on('recieved', function (data) {
        socket.to(currentUsers['user_' + data.from]).emit('new message', data);
    });

    socket.on('disconnect', function (data) {
        console.log(socket.name + ' Left');
        currentUsers['user_' + socket.name] = undefined;
        console.log(data);
    });

    socket.on('game', function (data) {
        console.log(data);
    });
});
