var bodyParser  = require('body-parser');
var express     = require('express');
// var server = require('http').createServer(app);
var morgan      = require('morgan');
var handler     = require('./server/requestHandler.js');
var http 				= require('http');
var io          = require('socket.io');
var jeopardy    = require('./server/jService.js');
// simplified http client supporting HTTPs https://github.com/request/request
// for accessing Jeopardy API.

var app = express();
// process.env.PORT is provided by the deployment server -- if we're running localhost, use 8000;
var PORT = process.env.PORT || 8000;
app.use(bodyParser.json());


// Everything in the /client directory and subdirectories will be served at [hostname]/client.
// As of now, there is no route to '/' so don't worry if you get a "cannot GET" error at Localhost:8000
app.use('/client',express.static(__dirname + '/client'));
app.use(morgan('dev'));

app.use('/teacher', express.static(__dirname + '/client/teacher'));
app.use('/student', express.static(__dirname + '/client/student'));
app.use('/modules', express.static(__dirname + '/node_modules'));
app.use('/materialize', express.static(__dirname+ '/node_modules/materialize-css/'));

app.use('/', express.static(__dirname + '/client'));

app.post('/signup',
  function(req, res){
    // req.headers.username
    // req.headers.password
    console.log("signup!");
    res.send(200);
  }
);

app.get('/data',
  function(req, res){
    // db.getStudentData(req.headers.token)
  }
);

console.log('App is listening on port ' + PORT);
// We require socket.io to have the entire server passed in as an argument,
// so we create a server variable to pass into socket.io's .listen method.
var server = app.listen(PORT);
var io = require('socket.io').listen(server);

module.exports = app;

//--------------------------------
// WEBSOCKETS
//--------------------------------

//Everything that requires Websockets lives INSIDE this callback.
io.sockets.on('connection', function(socket) {

  // new game
  socket.on('new-game', function(data){
    var code = handler.gameMaker(data);
    handler.games[code].owner = socket;
    socket.emit('made-game', {code: code});
  });

  // when student joins
  socket.on('student-join', function(data){
    if (!handler.games[data.code]) {
      console.log("tried to enter a non existant game: " + data.code);
      socket.emit('no-game');
    }
    else {
      handler.games[data.code].students[data.username] = socket;
      socket.emit('you-joined');
      handler.games[data.code].owner.emit('update-list', Object.keys(
        handler.games[data.code].students
      ));
      console.log(Object.keys(handler.games[data.code].students));
    }
  });

  socket.on('buzz', function(data){
    handler.games[data.code].owner.emit('buzzed-in', {username:data.username, time: data.time});
  });

  socket.on('newQ', function(data){
    if (!handler.games[data.code]) socket.emit('error');
    else jeopardy.getQ(function(ques){
      handler.games[data.code].owner.emit('asked-question', ques);
      delete ques.answer;
      for(var student in handler.games[data.code].students){
        handler.games[data.code].students[student].emit('ask-question', ques);
      }
    });
  });

});

//--------------------------------
// END WEBSOCKETS
//--------------------------------
