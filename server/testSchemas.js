var mongoose = require('./data.js');
mongoose.User.find().exec(function (err, users) {
    if (!err && users.length > 0) {
        console.log('There are users: ' + users.length);
        users.map(function (user) {
            user.deepPopulate('friendsList.friendGroups.friends.profile', function (err) {
                if(!err){
                console.log(user.friendsList.friendGroups);
                }
            });
        });
    } else {
        console.log('No users');
    }
});

var users = ['Sir Fxwright', 'Sir Yogi Bear', 'Sir Varayne', 'Sir Pretzel', 'Sir Slagnificent', 'SaucySeadweller'];
//users.map(function(userName){
//    var newUser = {username:userName,password:'password'};
//    mongoose.makeNewUser(newUser,function(user){
//        console.log(user);
//    });
//});
//
mongoose.User.findOne({
    username: users[0]
}).exec(function (err, user) {
    if (!err && user) {
        mongoose.addFriend(user, users[3]);
    }
});
