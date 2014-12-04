var data = function () {

    var mongoose = require('mongoose');
    var siteDB = 'mongodb://admin:tetris@ds053190.mongolab.com:53190/tetris';
    var testDB = 'mongodb://admin:tetris@ds061360.mongolab.com:61360/tetris-test';
    mongoose.connect(process.env.PORT ? siteDB:testDB);
    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'Connection Error: '));
    this.Score = mongoose.model('Score', {
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

    this.User = mongoose.model('User', {
        userName: String,
        name : {
            first: String,
            last: String
        },
        password: String,
        avatar: String,
        email: String,
        profile: {}
    });
    return this;
};

module.exports = new data();
