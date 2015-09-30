var request    = require('supertest')
	,	should     = require('should')
  , express    = require('express')
  , bodyParser = require('body-parser')
  , io         = require('socket.io-client')
  ,	should     = require('should')
  , request    = require('supertest')
  , server     = require('../server.js')

var socketURL = 'http://0.0.0.0:8000';


var options ={
  transports: ['websocket'],
  'force new connection': true
};

var student1 = {'name':'Ariel'};
var student2 = {'name':'Bertie'};
var student3 = {'name':'Charlie'};

describe('Basic server', function(){

//test for server POST on /signup
  it('/signup should accept POST requests', function (done){
    request(server)
      .post('/data')
      .expect(201, done)
  });

//test for server GET call from /data

  it('/data should accept GET requests', function (done){
    request(server)
      .get('/data')
      .expect(200, done)
  });

//test for broadcast of one game: 

  xit('Should broadcast new user once they connect',function(done){
    var client = io.connect(socketURL, options);

    client.on('connect',function(data){
      client.emit('connection name', student1);
    });

    client.on('new user',function(usersName){
      usersName.should.be.type('string');
      usersName.should.equal(student1.name + " has joined");
      client.disconnect();
      done(); 
    });
  });

	//test for two users: one user logs in, second user emits login and first user waits for second user to emit new log in. 

	xit('Should broadcast new user to all users', function(done){
		
		var numUsers = 0;

	  var client1 = io.connect(socketURL, options);

	  client1.on('connect', function(data){
	    client1.emit('connection name', student1);

	    client1.on('new user', function(usersName){
	    numUsers += 1;
			if(numUsers === 2){
	      usersName.should.equal(student2.name + " has joined");
	      client1.disconnect();
	      done();
	    }
	  });

	    /* Since first client is connected, we connect
	    the second client. */
	    var client2 = io.connect(socketURL, options);

	    client2.on('connect', function(data){
	      client2.emit('connection name', student2);
	    });

	    client2.on('new user', function(usersName){
	      usersName.should.equal(student1.name + " has joined");
	      client2.disconnect();
	    });
	  });	  
	});

  //one client broadcasts one message to all clients

	  xit('Should be able to broadcast messages', function (done){
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