var data = function () { // jshint ignore:line

    var mongoose = require('mongoose');
    var schemas = require('./schemas.js');
    var siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris';
    var testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test';
    mongoose.connect(process.env.PORT ? siteDB : testDB);
    var data = {};
    data.db = mongoose.connection;
    data.db.on('error', console.error.bind(console, 'Connection Error: '));
    data.ObjectId = mongoose.Types.ObjectId;
    data.Score = mongoose.model('Score', schemas.ScoreSchema);
    data.Profile = mongoose.model('Profile', schemas.ProfileSchema);
    data.ChatMessage = mongoose.model('ChatMessage', schemas.ChatMessageSchema);
    data.ChatThread = mongoose.model('ChatThread', schemas.ChatThreadSchema);
    data.User = mongoose.model('User', schemas.UserSchema);
    data.getUserChatThreads = function (profileId, callback) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                data.ChatThread.find({
                    users: userProfile._id
                }).populate('messages users').exec(function (err, chatThreads) {
                    if (!err && chatThreads && callback) {
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

    data.messageProfile = function (profileId, chatMessage, socket) {
        data.Profile.findOne({
            _id: data.ObjectId(profileId)
        }).exec(function (err, userProfile) {
            if (!err && userProfile) {
                console.log('Sending message to: ' + userProfile.username);
                userProfile.connections.map(function (userSocket) {
                    console.log(userProfile.username + ' is connected.');
                    socket.to(userSocket).emit('new_message', chatMessage);
                });
            }
        });
    };
    return data;
};

module.exports = new data();
