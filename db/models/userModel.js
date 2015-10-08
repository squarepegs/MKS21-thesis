var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local: {
    username: String,
    password: String
  },

  facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},

  profile: {
    firstName: {
      type: String,
      default: "First name not set"
    },
    lastName: {
      type: String,
      default: "Last name not set"
    },
    email: {
      type: String,
      default: "Email not set"
    }
  },
  decks: {
    type: Array
  }

});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);
