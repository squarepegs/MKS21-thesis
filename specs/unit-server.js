var request = require('supertest')
  , express = require('express')
  , bodyParser = require('body-parser');

describe('Basic server', function(){

var app = require('../server.js');


it('landing should accept GET requests', function (done){
		console.log('inside test suite')
		request(app)
	  .get('/')
	  .expect(200)
	  .end(function (err, res){
	    if (err) throw err;
	    done();
	  });
	});

//main dash route test

	it('/main-dash should accept GET requests', function (done){
		request(app)
		.get('/main-dash')
		.expect(200)
		.end(function(err, res){
		  if (err) return done(err);
		  done();
		});
	});

	it('/main-dash should accept POST requests', function (done){
		request(app)
		.get('/main-dash')
		.expect(200)
		.end(function(err, res){
		    if (err) return done(err);
		    done();
		});
	});

//TO DO: student:code socket test


//game-dash:code route test

	it('/game-dash:code should accept POST requests', function (done){
		request(app)
		.post('/game-dash:code')
		.expect(201)
		.end(function(err, res){
			if (err) return done(err);
			done();
		});
	});

	it('/game-dash:code should accept GET requests', function (done){
		request(app)
		.get('/game-dash:code')
		.expect(200)
		.end(function(err, res){
			if (err) return done(err);
			done();
		});
	});

//TO FINISH POST MVP: 404 for non routes; auth check

	xit('should return 404 for non-routes', function (done){
		request(app)
		.get('/garblegarble')
		.expect(404)
		.end(function (err, res){
			if(err) return done(err);
			done();
		});
	});

	xit('should return only allow authorized users', function (done){
		request(app)
		.get('/')
	})

	xit('should return a parseable JSON obj with question and answer', function (done){
		 request(app)
		 .get('/')
		 .expect(function (res){
		 	res.body.question = 'Who done it?',
		 	res.body.answer = res.body.answer.toUpperCase();
		 })
		 .expect(200, {
		 	question: 'Who done it?',
		 	answer: 'TOBI'
		 }, done)
	});
});