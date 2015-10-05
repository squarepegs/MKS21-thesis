var mongoose = require('mongoose');

console.log('userModel.js');

var userSchema = mongoose.Schema({
  local: {
    username: String,
    password: String
  }
});

module.exports = mongoose.model('User', userSchema);
