var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {};

io.sockets.on('connection', function (socket) {

    socket.on('login', function (data) {
        currentUsers["user_" + data.name] = socket.id;
        console.log("Logged IN! " + data.name);
    });

    socket.on('new_message', function (data) {
        data.timeStamp = "[" + new Date().toLocaleTimeString().slice(0,5) + "] ";
        console.log("Send message " + data);
        if (!data.whisper){
            io.emit('new_message', data);
        }else{
            socket.to(currentUsers["user_" + data.to]).emit('new_message', data);
        }
    });

    socket.on('recieved', function (data) {
        socket.to(currentUsers["user_" + data.from]).emit('new message', data);
    });

    socket.on('disconnect', function (data) {
        console.log(socket.name + " Left");
        currentUsers["user_" + socket.name] = undefined;
        console.log(data);
    });

    socket.on('game', function (data) {
        console.log(data);
    });
});
