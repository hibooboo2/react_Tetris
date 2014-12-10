var data = function () {

    var mongoose = require('mongoose');
    var siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris';
    var testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test';
    mongoose.connect(process.env.PORT ? siteDB : testDB);
    var data = {};
    data.db = mongoose.connection;
    data.db.on('error', console.error.bind(console, 'Connection Error: '));

    var ScoreSchema = new mongoose.Schema({
        level: Number,
        score: Number,
        linesCleared: Number,
        singles: Number,
        doubles: Number,
        triples: Number,
        tetrises: Number,
        comboCount: Number,
        lastCleared: Number
    });

    var UserSchema = new mongoose.Schema({
        username: String,
        name: {
            first: String,
            last: String
        },
        password: String,
        avatar: String,
        email: String,
        friends: [{
            username: String,
            note: {
                type: String,
                default: " "
            },
            group: {
                type: String,
                default: "General"
            }
        }]
    });


    var ProfileSchema = new mongoose.Schema({
        username: String,
        statusMessage: {
            type: String,
            default: "Online"
        },
        icon: {
            type: String,
            default: "http://i.imgur.com/APrRDck.png"
        },
        presence: Number
    });

    var ChatMessageSchema = new mongoose.Schema({
        users: [String],
        to: String,
        from: String,
        message: String,
        timeStamp: Date,
        chatThread: String
    });
    var ChatThread = new mongoose.Schema({
        users: [String],
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatMessage'
        }],
        name: String
    });

    data.Score = mongoose.model('Score', ScoreSchema);


    data.Profile = mongoose.model('Profile', ProfileSchema);
    var Profile = data.Profile;

    data.ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

    UserSchema.methods.addFriend = function (friend, sendUpdate) {
        var currentUser = this;
        var getProfile = function (username) {
            Profile.findOne({
                username: username
            }).exec(function (err, profile) {
                if (profile) {
                    var hasFriend = currentUser.friends.filter(function (friend) {
                        return friend.username === profile.username;
                    }).length > 0;
                    if (!hasFriend) {
                        currentUser.friends.push({
                            username: profile.username
                        });
                        var friends = currentUser.friends;
                        currentUser.save(function (err) {
                            if (!err) {
                                sendUpdate(friends);
                            }
                        })
                    }
                }
            });
        }
        getProfile(friend.username);
    };

    data.User = mongoose.model('User', UserSchema);

    data.getUserChats = function (username, callback) {
        data.ChatMessage.find({
            users: username
        }).exec(function (err, messages) {
            if (messages && callback) {
                callback(messages);
            }
        });
    };

    data.updateProfile = function (profile, notifyCallback, callback) {
        data.Profile.findOne({
            username: profile.username
        }).exec(function (err, profileFound) {
            if (profileFound) {
                profileFound.statusMessage = profile.statusMessage;
                profileFound.icon = profile.icon;
                profileFound.save(function (err) {
                    if (notifyCallback) {
                        var username = profileFound.username
                        var event = 'current_status';
                        var data = profileFound;
                        notifyCallback(event, data);
                        callback(profileFound);
                    }
                });
            }
        });
    }

    var genRandomUsers = function (err, users) {
        if (users.length < 100) {
            for (var i = 0; i < 100; i++) {
                new data.User({
                    username: 'user' + i,
                    password: 'password'
                }).save();
                new data.Profile({
                    username: 'user' + i
                }).save();
            }
        }
    }
    data.User.find().exec(genRandomUsers);
    var rand = function (max) {
        return Math.floor((Math.random() * max));
    }

    var users = ['Sir Fxwright', 'Sir Yogi Bear', 'Sir Varayne', 'Sir Pretzel', 'Sir Slagnificent', 'SaucySeadweller'];
    var randMessages = ['Hello there.', 'How are you?', 'I am fine', 'Nice to see you.', 'League is amazing', 'Fantastical sauce.']
    var newMessage = Math.random().toString(36).substring(7);
    var genMessages = function (err, messages) {
        if (messages.length<50000) {
            for (var i = 0; i < 50000-messages.length; i++) {
                var to =  users[rand(users.length)];
                var from =  users[rand(users.length)];
                var chatUsers =[to,from];
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
    }
    data.ChatMessage.find().exec(genMessages);

    return data;
};

module.exports = new data();
