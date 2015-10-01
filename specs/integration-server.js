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
var teacher2 = {'username': 'Mr. Socket'};
var teacher3 = {'username': 'Ms. Lonely'};
var student1 = {'username':'Bertie'};
var student2 = {'username':'Charlie'};
var student3 = {'username':'Danny'};
var student4 = {'username':'Edward'};


describe('Socket integration', function(){



  it('Should allow multiple clients to create different games' ,function (done){
    var client1 = io.connect(socketURL, options);
    var client2 = io.connect(socketURL, options);
    var client3 = io.connect(socketURL, options);

    var stdclient = io.connect(socketURL, options);

    //first teacher signs in
    client1.emit('new-game', teacher1);
    
    client1.on('made-game', function (game){
      student1.code = game.code;
    
    //student signs in
      stdclient.emit('student-join', student1);
    
    //handler of first game should have code property
      expect(handler.games).to.have.property(student1.code);

    //second teacher signs in, creates new game
      client2.emit('new-game', teacher2);
      
      client2.on('made-game', function (game){
    
      //there must be two different codes
        expect(game.code).to.not.equal(student1.code);
      
      //there should be two diff. handlers          
        expect(handler.games[student1.code]).to.not.equal(handler.games[game.code])

      //student 1 should still be in old game
        handler.games[student1.code].students.should.have.property(student1.username);

      //student1 should not be in new game  
        handler.games[game.code].students.should.not.have.property(student1.username);

      //new client creates a game and student signs off, client 1 signs off  
        client3.emit('new-game', teacher3);
      
        var oldCode = game.code; 
        client1.disconnect();  
        stdclient.disconnect();
      
      client3.on('made-game', function (game){
      
      //student joins into new game
        student1.code = game.code;
        stdclient.emit('student-join', student1);
      
      //check that oldCode is still usable and different than new game
        expect(oldCode).to.exist;
        expect(oldCode).to.not.equal(game.code);
      //handlers must be different again
        expect(handler.games[game.code]).to.not.equal(handler.games[oldCode]);
        
        client2.disconnect();
        client3.disconnect();
        stdclient.disconnect();
        done();
      });      
      });
    });
  });


  it('Should allow student clients to disconnect without disconnecting any other clients', function (done){
    
    var teacher = io.connect(socketURL, options);
    var client1 = io.connect(socketURL, options);
    var client2 = io.connect(socketURL, options);
    var client3 = io.connect(socketURL, options);

      teacher.emit('new-game', teacher1);
    
      teacher.on('made-game', function (game){
        var room = game.code;
        student2.code = room;
        student.emit('student-join', student2);
        
        handler.games.should.have.property(room);

        handler.games[room].should.have.property('students');
        });

      teacher.on('update-list', function (keys){
        keys[0].should.equal('Charlie');
        teacher.disconnect();
        student.disconnect();
        done();
      });     
  });

  it('Should not allow students to join non-existent games', function (done){

    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);
    
    teacher.emit('new-game', teacher1);
    student.emit('student-join', student1);
    
    teacher.on('made-game', function (data){
      
      student1.code.should.equal('1234');
      handler.games[data.code].should.exist;
      expect(handler.games[student1.code]).to.not.exist;
      student.disconnect();
      teacher.disconnect();
      done();
    });
  });

  it('Should brodcast buzzes of students in a room', function (done){
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);
    
    teacher.emit('new-game', teacher1);
    teacher.on('made-game', function (game){
      var room = game.code;
      student2.code = room;
      student.emit('student-join', student2);
      student2.time = new Date();
      student.emit('buzz', student2);
    });
    
    teacher.on('buzzed-in', function (buzzed){
      expect(handler.games[student2.code].owner).to.exist;
      buzzed.username.should.equal(student2.username);

      expect(buzzed.time).to.equal(student2.time.toISOString());
      buzzed.time.should.exist;
      student.disconnect();
      teacher.disconnect();
      done();
    });
    
  });

  it('Should not broadcast buzzes of students in a non-existent room', function (done){
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

    teacher.emit('new-game', teacher1);
    student.emit('student-join', student1);
    
    student1.time = new Date();
    student.emit('buzz', student1);
  
    expect(handler.games['1234']).to.not.exist;

    student.disconnect();
    teacher.disconnect();
    done();

  });

  it('Should not create questions from non-existent rooms', function (done){

    var teacher = io.connect(socketURL, options);

    teacher.emit('new-game', teacher2);
    
    teacher.on('made-game', function (game){
      var room = game.code;
      expect(room).to.not.equal('1234');        
      handler.games.should.have.property(room);
      teacher.emit('newQ', {code: '1234'});
      expect(handler.games['1234']).to.not.exist;
      teacher.disconnect();
      done();
    });  
  })

  it('Should broadcast questions ', function (done){
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

    teacher.emit('new-game', teacher1);
    teacher.on('made-game', function (game){
      student2.code = game.code;
      student.emit('student-join', student2);
      teacher.emit('newQ', {code: game.code});
    });

    teacher.on('asked-question', function (ques){
      expect(ques).to.have.property('category').that.is.a('string');
      expect(ques).to.have.property('question').that.is.a('string');
      expect(ques).to.have.property('answer').that.is.a('string');
      student.on('ask-question', function (ans){
        expect(ques.question).to.equal(ans.question);
        teacher.disconnect();
        student.disconnect();
        done();
      })
    });    
  });
});