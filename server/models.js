// database stuff here

module.exports = {
	createUser: function(username, password){
		//insert db query in knex here
		return function(){return "nothing here yet... need db. username/password were: " + username + "/" + password;};
	}
};
