var request = require('supertest')
	,	should = require('should')
  , express = require('express')
  , bodyParser = require('body-parser')
  , io = require('socket.io-client')
  ,	should = require('should')

var socketURL = 'http://0.0.0.0:5000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var student1 = {'name':'Ariel'};
var student2 = {'name':'Bertie'};
var student3 = {'name':'Charlie'};

describe('Basic server', function(){

	it('Should broadcast new user to all users', function(done){
		
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
});