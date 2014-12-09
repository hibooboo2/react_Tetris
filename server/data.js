var data = function () {

    var mongoose = require('mongoose');
    var siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris';
    var testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test';
    mongoose.connect(process.env.PORT ? siteDB : testDB);
    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'Connection Error: '));

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
            default: "New User"
        },
        icon: {
            type: String,
            default: "http://i.imgur.com/APrRDck.png"
        },
        presence:Number
    });

    var ChatMessageSchema = new mongoose.Schema({
        users: [String],
        to: String,
        from: String,
        message: String,
        timeStamp: Date
    });

    this.Score = mongoose.model('Score', ScoreSchema);


    this.Profile = mongoose.model('Profile', ProfileSchema);
    var Profile = this.Profile;

    this.ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

    UserSchema.methods.addFriend = function (friend, sendUpdate) {
        var currentUser = this;
        console.log('in add');
        console.log('');
        var getProfile = function (username) {
            Profile.findOne({
                username: username
            }).exec(function (err, profile) {
                if (profile) {
                    currentUser.friends.push({
                        username: profile.username
                    });

                    var friends = currentUser.friends.map(function (friend) {
                        friend.statusMessage = "A status";
                        return friend;
                    });
                    currentUser.save(function (err) {
                        if (!err) {
                            sendUpdate(friends);
                        }
                    })
                    console.log(friends);
                }
            });
        }
        getProfile(friend.username);
    };

    this.User = mongoose.model('User', UserSchema);

    this.getUserChats = function (user, callback) {
        this.ChatMessage.find({
            user: user
        }).exec(function (err, messages) {
            console.log(messages);
            if (messages && callback) {
                callback(messages);
            }
        });
    };

    this.updateProfile = function (profile, callback, socket) {
        this.Profile.findOne({
            username: profile.username
        }).exec(function (err, profileFound) {
            if (profileFound) {
                profileFound.status = profile.status;
                profileFound.icon = profile.icon;
                profileFound.save(function (err) {
                    if (callback) {
                        var username = profileFound.username
                        var event = 'current_status';
                        var data = profileFound;
                        callback(username, event, data);
                    }
                });
            }
        });
    }

    return this;
};

module.exports = new data();
