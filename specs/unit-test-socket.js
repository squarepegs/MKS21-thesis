var request    = require('supertest')
  , express    = require('express')
  , bodyParser = require('body-parser')
  , io         = require('socket.io-client')
  ,	should     = require('should')
  , chai       = require('chai')
  , expect     = chai.expect
  , assert     = chai.assert
  , sinon      = require('sinon')
  , request    = require('supertest')
  , server     = require('../index.js')
  , handler    = require('../server/requestHandler.js')
  , chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised);

var socketURL = 'http://0.0.0.0:8000';


var options ={
  // transports: ['websocket'],
  'force new connection': true
};

var teacher1 = {'id':'Mrs. Landingham'};
var teacher2 = {'id': 'Mr. Socket'}
var student1 = {'id':'Bertie', 'code': '1234'};
var student2 = {'id':'Charlie'};
var student3 = {'id':'Danny'};
var student4 = {'id':'Edward'};



describe('Basic server', function(){

//test for server POST on /signup
  xit('/signup should accept POST requests', function (done){
    request(server)
      .post('/signup')
      .expect(201, done)
  });

//test for server GET call from /data

  xit('/data should accept GET requests', function (done){
    request(server)
      .get('/data')
      .expect(200, done)
  });

//test for broadcast of creating a game: 

  it('Should be able to hear an event when it is in a room' ,function (done){
    var teacher = io.connect(socketURL);
    var student = io.connect(socketURL, options);
    //client side: teacher listens to message only if she's in the room       
    teacher.emit('new game', teacher1);

      teacher.on('welcome message', function (room){
        expect(room).to.equal(teacher.code);
        teacher.disconnect();
        student.disconnect();
        done();
      }); 
  });

  it('teacher should be able to change rooms users on ending a game', function (done){

    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

    teacher.emit('new game', teacher1);
    teacher.emit('change room', '1234');

    teacher.on('change message', function (msg){
      student.emit('student join', {'id':'Billy', 'code': '1234'});
      teacher.disconnect();
      student.disconnect();
      done();
    });
  });

  it('teacher should be able to emit questions', function (done){

    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

    teacher.emit('new game', teacher1);
    teacher.emit('change room', '1234');

    teacher.on('room code', function (msg){
      student.emit('student join', {'id':'Billy', 'code': '1234'});

    teacher.emit('end game', function (msg){
      student.on('student question', function (ques){
      teacher.disconnect();
      done();
      })
    })
    });
  });


  it('Student should be able to join a room', function (done){
    var teacher = io.connect(socketURL);
    var student = io.connect(socketURL, options);
    var student2 = io.connect(socketURL, options);

    teacher.emit('new game', teacher1)

    teacher.on('welcome message', function (room){

      student.emit('student join', room)
      student2.emit('student join', '1234')

    });
    
    student.on('welcome message', function (room){
      teacher.disconnect();
      student.disconnect();
      student2.disconnect();
      done();
    })

  });

  it.only('Client should be able to end a game', function (done){
    var teacher = io.connect(socketURL);
    var student = io.connect(socketURL, options);
    var student2 = io.connect(socketURL, options);

    teacher.emit('new game', teacher1).then(
    teacher.emit('change room', '1234')
    ).then(
    teacher.on('room code', function (room){
      student.emit('student join', {'id':'Billy', 'code': '1234'})
    })
    ).then(
      teacher.on('student joined', function (data){
    })
    )
    //TODO

  })

 it('Should be able to not an event when it is in a room' ,function (done){
    var teacher = io.connect(socketURL);
    //client side: teacher listens to message only if she's in the room       
    teacher.on('message', function (msg){
        expect(msg).to.equal('Joining room:1234')
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

    teacher.on('made-game', function (game){
      teacher.emit('newQ', {code: '1234'});
      var room = game.code;
      expect(room).to.not.equal('1234');        
      handler.games.should.have.property(room);
      expect(handler.games['1234']).to.not.exist;
      teacher.disconnect();
      done();
    });

    teacher.emit('new-game', teacher2);
     
  })

  it('Should broadcast questions ', function (done){
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);

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
    teacher.emit('new-game', teacher1);
  });

  it('Should listen to disconnects', function (done){
    var teacher = io.connect(socketURL, options);
    var student = io.connect(socketURL, options);
    
    teacher.disconnect();

  })

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

