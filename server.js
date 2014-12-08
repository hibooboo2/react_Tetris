var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('./server/data.js');

server.listen(process.env.PORT ? process.env.PORT : 3000);

app.use('/', express.static(__dirname + '/app'));
var currentUsers = {
    usersConnected: [],
    allConnections:[],
    usersBysocketId:[],
    getUserID: function () {

    },
    login: function (username, password, socket,afterLogin) {
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
                    console.log(currentUsers.usersConnected[username]);
                    io.sockets.emit('user_connected',user.username);
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
    currentUsers.allConnections.push(socket.id);
    console.log(currentUsers.allConnections);
    socket.on('login', function (data,afterLogin) {

        currentUsers.login(data.username, data.password, socket,afterLogin);
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
        data.users = [data.to,data.from];
        new mongoose.ChatMessage(data).save();
    });

    socket.on('recieved', function (data) {
        socket.to(currentUsers['user_' + data.from]).emit('new message', data);
    });

    socket.on('disconnect', function () {
        currentUsers.allConnections.splice(currentUsers.allConnections.indexOf(socket.id));
        console.log(socket.id + ' Left');
        if (currentUsers.usersBysocketId['user_id' + socket.id]) {
            var socketusername = currentUsers.usersBysocketId['user_id' + socket.id];
            console.log(currentUsers.usersBysocketId['user_id' + socket.id] + ' left.');
            currentUsers.usersConnected.splice(currentUsers.usersConnected.indexOf('user_id' + socket.id),1);
            currentUsers.usersConnected.splice(currentUsers.usersConnected[socketusername].indexOf(socket.id),1);
        }
    });

    socket.on('allusers', function (data) {
        console.log(currentUsers.allConnections.length);
        if(currentUsers.usersConnected[data]){
        console.log(data+ ' is connected '+currentUsers.usersConnected[data].length + 'times');
        }
    });
});
