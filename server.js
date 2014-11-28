var express = require('express'),
    app = express();
server = require('http').createServer(app),
io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/app'));

io.sockets.on('connection', function (socket) {
    socket.on('hello', function (data) {
        io.emit('connected', data.name + " at " +new Date().toLocaleTimeString() + " : " + data.message);
        console.log(data);
    });
});
