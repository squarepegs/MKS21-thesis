// var db = require('../models/userData.js'),
		// Auth  = require ('./auth.js');

module.exports = {
	//a dummy function for testing purposes:
	doSomething: function(req, res){
		console.log("hi! ");
		res.send("howdy!");
	},
	gameCodes: {},
	gameMaker: function(req, res){
		// should take in username, something like req.headers.username
		// and make that user the only one able to access the game-dash
		var username = req.headers.username;

		// here we set that game's unique id:
		var code = Math.floor(Math.random()*100000);

		// here we verify that, by some small chance, that
		// number is actually unique.
		for (var i = 0; i < gameCodes.length; i++) {
			if (code === gameCodes[i]) {
				code = Math.floor(Math.random()*100000);
				i = 0;
			}
		}
		// set that code to that username in our dictionary of active games.
		this.gameCodes[code] = username;
		console.log("created gamecodes: " + code);
		console.log("current gameCodes: " + this.gameCodes);
	},
	endGame: function(req, res){
		// need to think about all the things to happen here.
		// client side saving, or server side saving of stats?
		delete gameCodes[req.headers.code];
	}
};
