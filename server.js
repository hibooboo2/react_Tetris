var express = require('express'),
    app = express();
server = require('http').createServer(app),
io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {};
io.sockets.on('connection', function (socket) {
    console.log(socket.id + " Joined");
    socket.on('login', function (data) {
        currentUsers["user_" + data.name] = socket.id;
        socket.name = data.name;
        console.log(currentUsers);
    });
    socket.on('send message', function (data) {
        var spltMessage = "Failed to send a message."
        if (data.message !== undefined) {
            spltMessage = data.message.split(":");
        }
        if (spltMessage[0] === "/w") {
            socket.to(currentUsers["user_" + spltMessage[1]]).emit('new message', data.name + " Whispered: " + " (" + new Date().toLocaleTimeString() + "): " + spltMessage[2]);
        } else {
            io.emit('new message', data.name + " (" + new Date().toLocaleTimeString() + "): " + data.message);
            console.log(data);
            console.log(socket.name + " Said");
        }
    });
    socket.on('disconnect', function (data) {
        console.log(data);
        console.log(socket.name + " Left");
        currentUsers["user_" + socket.name] = undefined;
    });
    socket.on('game', function (data) {
        console.log(data);
    });
});
