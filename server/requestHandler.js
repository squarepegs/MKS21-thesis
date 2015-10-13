//var models = require('./models.js');
// var auth  = require ('./auth.js');

module.exports = {
  games: {"empty":"empty"}, //lets lines 20/21 be written very cleanly

  findHosts: function(clients){
    var hosts = [];
    for (var client in clients){
      if(clients[client].teacher===true){
        host.push(clients[client]);
        console.log('in findHosts: these are the hosts', host.username)
      }
    }

    return hosts;
  },

  findStudents: function(clients, code){
    var students = [];

    for (var client in clients){

      if((clients[client].code === code) && clients[client].username){

          if(clients[client].teacher === false){
            students.push(clients[client].username);
          }
      }
    }
    console.log('in findStudents: these are the clients in this room', students)
    return students
  },
  //need to find all unique rooms and send back to user

  findStudentSockets: function(clients, code){
    var students = [];
    console.log('in findStudentSockets, this is the students array at start', students)

    for (var client in clients){

      if((clients[client].code === code) && clients[client].username){

          if(clients[client].teacher === false){
            students.push(clients[client]);
          }
      }      
    }
    console.log('in findStudentSockets, this is the students array at finish', students)
    return students
  },

  findAllRooms: function (clients){
    var rooms = [];
    for (var client in clients){
      if(rooms.indexOf(clients[client].code) === -1){
        rooms.push(clients[client].code)
      }
    }
    console.log('in findAllRooms: here are all created rooms: ', rooms)
    return rooms;
  },

  findHost: function(clients, code){
    var host = null;

    for(var client in clients){
 
      if(clients[client].teacher === true){
        if(clients[client].rooms.indexOf(code) !== -1){

          host = clients[client];
          console.log('in findHost: this is a host', host.username, 'for this room ', host.code, 'which should match', code)
          return host;
        } 
      } 
    }

    console.log('no host found so we return ', host)
    return host;
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
