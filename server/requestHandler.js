//var models = require('./models.js');
// var auth  = require ('./auth.js');

module.exports = {
  games: {"empty":"empty"}, //lets lines 20/21 be written very cleanly

  findHosts: function(clients){
    var hosts = [];
    for (var client in clients){
      if(clients[client].teacher===true){
        host.push(clients[client]);
      }
    }
    return hosts;
  },

  //need to find all unique rooms and send back to user

  findAllRooms: function (clients){
    console.log('in find all Rooms')
    var rooms = [];
    for (var client in clients){
      if(rooms.indexOf(clients[client].code) === -1){
        rooms.push(clients[client].code)
      }
    }
    console.log('here are all created rooms: ', rooms)
    return rooms;
  },

  findHost: function(clients, code){
    var host = null;
    console.log('in handler: this is the student code', code);

    for(var client in clients){


    console.log('in handler: this client ', client, 'is a teacher', clients[client].teacher, 'and has a room', clients[client].code);
    
      if(clients[client].teacher === true){
        if(clients[client].rooms.indexOf(code) !== -1){

          host = clients[client];
          console.log('in handler: this is a host', host.id, 'for this room ', host.code, 'which should match', code)
          return host;
        } 
      } 
    }

    console.log('no host found so we return ', host)
    return host;
  },

  findStudents: function (clients, code){

  
  },
  
  gameMaker: function(data){
    // here we set that game's unique id and we verify that, by some
    // small chance, that number is actually unique.
    // by removing the vowels, we eliminate most of the bad words that 
    // can be created randomly.  
    var possible = "BCDFGHJKLMNPQRSTVWXZ";
    // For obvious reasons, these words should not be condoned.
    // If the random generator runs into one of thses, it'll just reroll.
    // We apologise.
    var badWords = ['NGGR', 'NGRR', 'NNGR', 'CVNT', 'FVCK', 'SHJT'];

    var code;
    do {
      code = "";
      for( var i=0; i < 4; i++ ){
      code += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    } while (this.games[code] || (badWords.indexOf(code) != -1)); // while game code is taken or it has created a bad word
    
    console.log("created gamecodes: " + code);
    console.log("current gameCodes: ");
    console.log(Object.keys(this.games));
    return code;
  },

  endGame: function(code){
    delete this.games[code];
   }
};
