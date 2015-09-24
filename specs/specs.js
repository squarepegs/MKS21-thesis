var request = require('supertest')
  , express = require('express')
  , body = require('body-parser');

describe('Basic server', function(){

var app = require('../server/server.js');


	it('should accept GET requests', function (done){
		request(app)
	  .get('/')
	  .expect(200)
	  .end(function(err, res){
	    if (err) throw err;
	    done();
	  });
	});

	it('should accept POST requests', function (done){
		request(app)
		.post('/')
		.expect(201)
		.end(function(err, res){
			if (err) throw err;
			done();
		});
	});

	it('should return 404 for non-routes', function (done){
		request(app)
		.get('/garblegarble')
		.expect(404)
		.end(function (err, res){
			if(err) throw err;
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