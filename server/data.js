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

    data.Score = mongoose.model('Score', ScoreSchema);


    data.Profile = mongoose.model('Profile', ProfileSchema);
    var Profile = data.Profile;

    data.ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

    UserSchema.methods.addFriend = function (friend, sendUpdate) {
        var currentUser = this;
        console.log('in add');
        console.log('');
        var getProfile = function (username) {
            Profile.findOne({
                username: username
            }).exec(function (err, profile) {
                if (profile) {
                    var hasFriend = currentUser.friends.filter(function (friend) {
                        return friend.username === profile.username;
                    }).length > 0;
                    console.log(hasFriend);
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
                        console.log(friends);
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
            console.log(messages);
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
                        console.log('Updating');
                        notifyCallback(event, data);
                        callback(profileFound);
                    }
                });
            }
        });
    }

    var genRandomUsers = function(err, users){
        console.log(users.length);
        if(users.length<100){
            for (var i=0;i<100;i++){
                new data.User({username:'user'+i,password:'password'}).save();
                new data.Profile({username:'user'+i}).save();
            }
        }
    }
    data.User.find().exec(genRandomUsers);

    return data;
};

module.exports = new data();
