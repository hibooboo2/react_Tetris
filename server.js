var express = require('express'),
    app = express();
server = require('http').createServer(app),
io = require('socket.io').listen(server);
var serverPort = process.env.PORT ? process.env.PORT : 3000;
server.listen(serverPort);
console.log("server started port: " + serverPort);
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
        data.message = data.from + " (" + new Date().toLocaleTimeString() + "): " + data.message;
        io.emit('new message', data);
        console.log(data);
        console.log(socket.name + " Said");
    });
    socket.on('recieved', function (data) {
        socket.to(currentUsers["user_" + data.from]).emit('new message', data);
    });
    socket.on('whisper', function (data) {
        data.message = data.from + " Whispered (" + new Date().toLocaleTimeString() + "): " + data.message;
        socket.to(currentUsers["user_" + data.to]).emit('new message', data);
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
