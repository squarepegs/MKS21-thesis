//var models = require('./models.js');
// var auth  = require ('./auth.js');

module.exports = {
  games: {"empty":"empty"}, //lets lines 20/21 be written very cleanly

  // roomProfiles: function (clients, room){
  //   var profiles = [];
  //   var profile = {};

  //   for(var client in clients){
  //     profile[client.id] = client.username;
  //     profile.host = client.teacher; 
  //     profile.joinedRooms = client.rooms;
  //     proflies.push(profile)
  //   }
    
    
    
  //   return profiles
  // },

  findHost: function(clients, code){
    var host = null;
    console.log('this is the student code', code);

    for(var client in clients){

    console.log('this client ', client, 'is a teacher', clients[client].teacher, 'and has a room', clients[client].code);
    
      if(clients[client].teacher === true){
        if(clients[client].rooms.indexOf(code)){

          host = clients[client];
          return host;
        } else {
          continue;  
        }
      } else {
        continue;
      }
    }
    return host;
  },

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

    var username = data.id;
    this.games[code] = {owner:'', students:{}};
    
    console.log("created gamecodes: " + code + ", " + username);
    console.log("current gameCodes: ");
    console.log(Object.keys(this.games));
    return code;
  },

  endGame: function(code){
    delete this.games[code];
   }
};
