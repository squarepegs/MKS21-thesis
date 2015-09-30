var models = require('./models.js');
// var auth  = require ('./auth.js');

module.exports = {
  games: {"empty":"empty"}, //lets lines 20/21 be written very cleanly

  gameMaker: function(data){
    // to test type this in the terminal:
    //// curl -X POST --header "username: billy" localhost:8000/newGame
    // you will get get back a game code.
    //// curl localhost:8000/game-dash/*insert game code here*
    //// on the server, you will see an announcement of who the owner is.

    // here we set that game's unique id and we verify that, by some
    // small chance, that number is actually unique.
    var possible = "BCDFGHJKLMNPQRSTVWXZ";
    // For obvious reasons, these words should not be condoned.
    // If the random generator runs into one of thses, it'll just reroll.
    var badWords = ['NGGR', 'NGRR', 'NNGR', 'CVNT', 'FVCK', 'SHJT'];

    var code;
    do {
      code = "";
      for( var i=0; i < 4; i++ ){
      code += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    } while (this.games[code] || (badWords.indexOf(code) != -1)); // while game code is taken or it has created a bad word

    var username = data.username;
    this.games[code] = {owner:'', students:{}};
    console.log("created gamecodes: " + code + ", " + username);
    console.log("current gameCodes: ");
    console.log(Object.keys(this.games));
    return code;
  },

  endGame: function(req, res){
    // need to think about all the things to happen here.
    // client side saving, or server side saving of stats?
    delete games[req.headers.code];
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
