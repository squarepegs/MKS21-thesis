var request    = require('supertest')
	,	should     = require('should')
  , express    = require('express')
  , bodyParser = require('body-parser')
  , io         = require('socket.io-client')
  ,	should     = require('should')
  , chai       = require('chai')
  , expect     = chai.expect
  , assert     = chai.assert
  , sinon      = require('sinon')
  , request    = require('supertest')
  , server     = require('../server.js')
  , handler    = require('../server/requestHandler.js')

var socketURL = 'http://0.0.0.0:8000';


var options ={
  transports: ['websocket'],
  'force new connection': true
};

var teacher1 = {'username':'Mrs. Landingham'};
var teacher2 = {'username': 'Mr. Socket'}
var student1 = {'username':'Bertie', 'code': '1234'};
var student2 = {'username':'Charlie'};
var student3 = {'username':'Danny'};
var student4 = {'username':'Edward'};


describe('Basic server', function(){

//test for server POST on /signup
  it('/signup should accept POST requests', function (done){
    request(server)
      .post('/signup')
      .expect(201, done)
  });

//test for server GET call from /data

  it('/data should accept GET requests', function (done){
    request(server)
      .get('/data')
      .expect(200, done)
  });

//test for broadcast of creating a game: 

  it('Should be able to create a game with an owner and emit a code' ,function (done){
    var teacher = io.connect(socketURL, options);

    teacher.emit('new-game', teacher1);
    
    teacher.on('made-game', function (game){
      game.should.have.property('code').which.is.a.String();
      handler.games.should.have.property(game.code);

	    client2.on('new user', function(usersName){
	      usersName.should.equal(student1.name + " has joined");
	      client2.disconnect();
	    });
	  });	  
	});

	  it('Should be able to broadcast messages', function (done){
    var client1, client2, client3;
    var message = 'Hello World';
    var messages = 0;

    var checkMessage = function(client){
      client.on('message', function (msg){
        message.should.equal(msg);
        client.disconnect();
        messages++;
        if(messages === 3){
        messages.should.equal(3);  
          done();
        };
      });
    };

    client1 = io.connect(socketURL, options);
    checkMessage(client1);

    client1.on('connect', function(data){
      client2 = io.connect(socketURL, options);
      checkMessage(client2);

      client2.on('connect', function(data){
        client3 = io.connect(socketURL, options);
        checkMessage(client3);

        client3.on('connect', function(data){
          client2.send(message);
        });
      });
    });
  });


});