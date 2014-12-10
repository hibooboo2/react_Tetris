var data = function () { // jshint ignore:line

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
        lastCleared: Number,
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        }
    });

    var UserSchema = new mongoose.Schema({
        username: String,
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        },
        name: {
            first: String,
            last: String
        },
        password: String,
        avatar: String,
        email: String,
        friends: [{
            profile: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Profile'
            },
            note: {
                type: String,
                default: ' '
            },
            group: {
                type: String,
                default: 'General'
            }
        }]
    });


    var ProfileSchema = new mongoose.Schema({
        username: String,
        statusMessage: {
            type: String,
            default: 'Online'
        },
        icon: {
            type: String,
            default: 'http://i.imgur.com/APrRDck.png'
        },
        presence: {
            type: Number,
            default: 0
        }
    });

    var ChatMessageSchema = new mongoose.Schema({
        to: String,
        from: String,
        message: String,
        timeStamp: Date
    });

    var ChatThreadSchema = new mongoose.Schema({
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        }],
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
    data.ChatThread = mongoose.model('ChatThread', ChatThreadSchema);

    var testThread = new data.ChatThread({ // jshint ignore:line
        users: ['James', 'james', 'Bob'],
        name: 'What the fuck'
    });

    var testMessage = new data.ChatMessage({ // jshint ignore:line
        to: 'Bob',
        from: 'Huff',
        message: 'Wow omfg a message in a thread.',
        timeStamp: new Date(),
        users: ['Bob', 'Huff'],
        chatThread: 'What the hell'
    });

    UserSchema.methods.addFriend = function (friend, sendUpdate) {
        var currentUser = this;
        var getProfile = function (username) {
            Profile.findOne({
                username: username
            }).exec(function (err, profile) {
                if (profile) {
                    var hasFriend = currentUser.friends.filter(function (friend) {
                        console.log(friend.profile.username === profile.username);
                        return friend.profile.username === profile.username;
                    }).length > 0;
                    if (!hasFriend) {
                        console.log(currentUser);
                        currentUser.friends.push({
                            profile: profile
                        });
                        var friends = currentUser.friends;
                        currentUser.save(function (err) {
                            if (!err) {
                                sendUpdate(friends);
                            }
                        });
                    }
                }
            });
        };
        getProfile(friend.username);
    };

    data.User = mongoose.model('User', UserSchema);
    data.getUserChatThreads = function (profileId, callback) {
        data.Profile.findOne({
            _id: profileId
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                data.ChatThread.find({
                    users: userProfile._id
                }).populate('messages users').exec(function (err, chatThreads) {
                    if (!err && chatThreads && callback) {
                        console.log(chatThreads);
                        callback(chatThreads);
                    }
                });
            }
        });
    };

    data.updateStatus = function (status, notifyCallback, callback) {
        data.Profile.findOne({
            username: status.username
        }).exec(function (err, profileFound) {
            if (profileFound) {
                profileFound.statusMessage = status.statusMessage;
                profileFound.save(function (err) {
                    if (!err && notifyCallback) {
                        var event = 'current_status';
                        notifyCallback(event, profileFound);
                        callback(profileFound);
                    }
                });
            }
        });
    };

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
    };
    data.User.find().exec(genRandomUsers);
    var rand = function (max) {
        return Math.floor((Math.random() * max));
    };

    var users = ['Sir Fxwright', 'Sir Yogi Bear', 'Sir Varayne', 'Sir Pretzel', 'Sir Slagnificent', 'SaucySeadweller'];
    var randMessages = ['Hello there.', 'How are you?', 'I am fine', 'Nice to see you.', 'League is amazing', 'Fantastical sauce.'];
    var newMessage = Math.random().toString(36).substring(7); // jshint ignore:line
    var genMessages = function (err, messages) {// jshint ignore:line
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
    //data.ChatMessage.find().exec(genMessages);

    return data;
};

module.exports = new data();
