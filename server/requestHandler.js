var models = require('./models.js');
// var auth  = require ('./auth.js');

module.exports = {
	gameCodes: {"empty":"empty"}, //lets lines 14/15 be written very cleanly

	gameMaker: function(req, res){
		// this works! type this in the terminal:
		//// curl --header "username: billy" localhost:8000/newGame

		// should take in username, something like req.headers.username
		// and make that user the only one able to access the game-dash
		var username = req.headers.username;
		var code = "empty";
		// here we set that game's unique id and we verify that, by some
		// small chance, that number is actually unique.
		while (this.gameCodes[code])
			code = Math.floor(Math.random()*1000000);

		// set that code to that username in our dictionary of active games.
		this.gameCodes[code] = username;
		console.log("created gamecodes: " + code + ", " + username);
		console.log("current gameCodes: ");
		console.log(this.gameCodes);
		res.send("your gamecode is " + code + ", and username of owner is: " + username);
	},

	endGame: function(req, res){
		// need to think about all the things to happen here.
		// client side saving, or server side saving of stats?
		delete gameCodes[req.headers.code];
	},

	signup: function(req, res){
		var username = req.headers.username;
		var password = req.headers.password;
		models.createUser(username,password)
		.then(function(result){
			// "your username might be " + username + " and your password could be: " + password

			// this breaks.
			res.send( result() );
		});
	}
};
