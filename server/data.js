var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'Connection Error: '));

console.log();
