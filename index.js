var bodyParser   = require('body-parser');
var express      = require('express');
var morgan       = require('morgan');
var handler      = require('./server/requestHandler.js');
var http         = require('http');
var io           = require('socket.io');
var cookieParser = require('cookie-parser')
var session      = require('express-session');
var mongoose     = require('mongoose');
var jeopardy     = require('./server/jService.js');
var passport     = require('passport');
var flash        = require('connect-flash');

var app = express();
var PORT = process.env.PORT || 8000;

var configDB = require('./db/config.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({secret: 'anystringoftext',
                saveUnintialitzed: true,
                resave: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// require('./config/middleware.js')(app, express);

// Everything in the /client directory and subdirectories will be served at [hostname]/client.
app.use('/client',express.static(__dirname + '/client'));

app.use('/teacher', express.static(__dirname + '/client/teacher'));
app.use('/student', express.static(__dirname + '/client/student'));
app.use('/modules', express.static(__dirname + '/node_modules'));
app.use('/materialize', express.static(__dirname+ '/node_modules/materialize-css/'));

app.use('/', express.static(__dirname + '/client/landing_page'));

require('./config/routes.js')(app, passport);
// app.post('/signup',
//   function(req, res){
//     // req.headers.username
//     // req.headers.password
//     console.log("signup!");
//     res.send(201);
//   }
// );

// app.get('/data',
//   function(req, res){
//     console.log('calling GET on /data; doesn\'t do anything right now');
//     res.send("not doing anything right now... go code me!");
//   }
// );

// app.post('/data',
//   function(req, res){
//     for(var key in req){
//       console.log(req.key);
//     }
//     //console.log('req.body: ', req.body)
//     //models.users.createUser(req.body.login, req.body.email, req.body.hashedPassword, req.body.firstName, req.body.lastName);
//   }
// );

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
