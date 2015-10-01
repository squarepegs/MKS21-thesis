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
var teacher2 = {'username': 'Mr. Socket', 'code':'1234'}
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

      handler.games[game.code].owner.should.exist;

      handler.games[game.code].owner.should.not.have.property('students');
      
      teacher.disconnect();
      done();
    });
  });


  it('Should allow students to join a created game', function (done){
    
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

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

  // xit('Should allow multiple students to join a game', function (done){
  //   var teacher = io.connect(socketURL, options);
  //   var client2 = io.connect(socketURL, options);
  //   var client3 = io.connect(socketURL, options);
  //   var client4 = io.connect(socketURL, options);

  //   teacher.emit('new-game', teacher1);
  //   client2.emit('student-join', student2);
  //   client3.emit('student-join', student3);
  //   client4.emit('student-join', student4);

    
  // });
  

	//test for two users: one user logs in, second user emits login and first user waits for second user to emit new log in. 



