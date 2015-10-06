var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

console.log('userModel.js');

var userSchema = mongoose.Schema({
  local: {
    username: String,
    password: String
  }
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.vaildPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);
