var data = require('./server/data.js');

var genRandomUsers = function (err, users) {
    if (users.length < 100) {
        for (var i = 0; i < 100; i++) {
            var aProfile = new data.Profile({
                username: 'user' + i
            }).save(function (err) {
                if (!err) {
                    new data.User({
                        username: 'user' + i,
                        password: 'password',
                        profile: aProfile
                    }).save();
                }
            }); // jshint ignore:line
        }
    }
};

data.User.find().exec(genRandomUsers);

var rand = function (max) {
    return Math.floor((Math.random() * max));
};

var users = ['Sir Fxwright', 'Sir Yogi Bear', 'Sir Varayne', 'Sir Pretzel', 'Sir Slagnificent', 'SaucySeadweller'];


data.Profile.find({
    username: users
}).exec(function (err, usersFound) {
    var usersToAdd = [];
    if (!err && usersFound.length) {
        usersFound = usersFound.map(function (user) {
            return user.username;
        });
        usersToAdd = users.filter(function (user) {
            return usersFound.indexOf(user) === -1;
        });
    } else {
        usersToAdd = users;
    }
    usersToAdd.map(function (username) {
        var aProfile = new data.Profile({
            username: username
        }).save(function (err) {
            if (!err) {
                new data.User({
                    username: username,
                    password: 'password',
                    profile: aProfile
                }).save();
            }
        });
    });
});

var randMessages = ['Hello there.', 'How are you?', 'I am fine', 'Nice to see you.', 'League is amazing', 'Fantastical sauce.'];
//var newMessage = Math.random().toString(36).substring(7);
var genMessages = function (err, messages) {
    if (messages.length < 50000) {
        for (var i = 0; i < 50000 - messages.length; i++) {
            var to = users[rand(users.length)];
            var from = users[rand(users.length)];
            var chatUsers = [to, from];

            new data.ChatMessage({
                users: chatUsers,
                to: to,
                from: from,
                message: randMessages[rand(randMessages.length)],
                timeStamp: new Date(),
                chatThread: chatUsers.sort().toString()
            }).save();
        }
    }
};
data.ChatMessage.find().exec(genMessages);
