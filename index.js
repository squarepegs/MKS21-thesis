var bodyParser   = require('body-parser');
var express      = require('express');
var morgan       = require('morgan');
var handler      = require('./server/requestHandler.js');
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var mongoose     = require('mongoose');
var jeopardy     = require('./server/jService.js');
var passport     = require('passport');
var flash        = require('connect-flash');
var helpers      = require('./config/helpers');
var MongoStore = require('connect-mongo')(session);

var app = express();
var PORT = process.env.PORT || 8000;

var configDB = require('./db/config.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({secret: 'anystringoftext',
                saveUnintialitzed: true,
                resave: true,
                store: new MongoStore({mongooseConnection: mongoose.connection})
                }));

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
app.use('/form', express.static(__dirname + '/client/teacher/form'));
app.use('/modules', express.static(__dirname + '/node_modules'));
app.use('/materialize', express.static(__dirname+ '/node_modules/materialize-css/'));

app.use('/', express.static(__dirname + '/client/landing_page'));

require('./config/routes.js')(app, passport);

console.log('App is listening on port ' + PORT);
// We require socket.io to have the entire server passed in as an argument,
// so we create a server variable to pass into socket.io's .listen method.
var server = http.listen(PORT);

// helpers.csvParser();

var io = require('socket.io')(server);

module.exports = app;

//--------------------------------
// WEBSOCKETS
//--------------------------------

//Everything that requires Websockets lives INSIDE this callback.

var allSocketIds = [];
//rooms array will store a room for the clients to join
var rooms = [];

io.on('connection', function (socket) {

console.log(socket.id, 'connected to the server')
allSocketIds.push(socket.id)
console.log('these are all the active clients', allSocketIds)

//NEW GAME listener for teacher created by server: 
socket.on('new game', function (user){

//request handler creates room code
var room = handler.gameMaker(user);
rooms.push(room);


//username saved in socket
socket.userid = user.id;

//checks if teacher is in room, if it is socket leaves saved room, and joins new created room

if(socket.code){
console.log('this should not appear')
    socket.leave(socket.code);
    socket.join(room);  
} else {

//if it isn't, new room saved in socket.code  
socket.code = room;

//teacher socket joins new room
socket.join(socket.code); 
console.log('the teacher should be in these rooms on new game', socket.rooms)
}
//server emits welcome message and room code
io.in(socket.code).emit('welcome message', room)
    
});

//STUDENT JOIN ROOM LISTENER

socket.on('student join', function (room){
  
  console.log('this should ping when student attempts to joins this room: ', room)
//if room exists, then ...
  if(rooms.indexOf(room) !== -1){
  
  //save room in student's socket
  socket.code = room;
  console.log('the room is saved as', socket.code)
  //student now joins room
  socket.join(socket.code);
  
  //server says hello
  io.to(socket.code).emit('welcome message', room)

  } else {

  io.emit('error', 'this is an error')
    console.log('these are the error', socket.rooms)
  }
  console.log('these are the existing rooms', rooms)

});


//CHAMGE ROOMS LISTENER for stdnt and teacher

socket.on('change room', function (newRoom){
  
  console.log('this should be the room saved in the socket', socket.code, 'this should be the newRoom', newRoom)
  console.log('the socket should be in these rooms before change', socket.rooms)
  
  socket.leave(socket.code)
  
  socket.join(newRoom);
  
  socket.code = newRoom;
  
  io.to(socket.code).emit('change message', 'welcome to '+socket.code)
  
  console.log('the socket should be in these rooms on change game', socket.rooms)
})

//END GAME for teacher
console.log('these are the active rooms before join', socket.rooms)

socket.on('end game', function (room) {
  //if teacher is in room then check
  
  

})

//NEW QUESTION LISTENER for teacher

// socket.on('newQ', function (data){
  
//   if (!socket.code){ 
//     socket.emit('error');
//   }
//   else jeopardy.getQ(function(ques){
//       handler.games[data.code].owner.emit('asked-question', ques);
//       delete ques.answer;
//       for(var student in handler.games[data.code].students){
//         handler.games[data.code].students[student].emit('ask-question', ques);
//       }
//     });
//   });


socket.on('disconnect', function(){
  console.log(socket.id, ' has disconnected from the server')
})

  socket.on('error', function (err){
    console.log('this is the error: ', err)
  })

  //teacher socket on made-game hears a code, and joins the room

  // // when student joins
  // socket.on('student-join', function(data){
  //   if (!handler.games[data.code]) {
  //     console.log("tried to enter a non existant game: " + data.code);
  //     socket.emit('no-game');
  //   }
  //   else {
  //     handler.games[data.code].students[data.username] = socket;
  //     socket.emit('you-joined');
  //     handler.games[data.code].owner.emit('update-list', Object.keys(
  //       handler.games[data.code].students
  //     ));
  //     console.log(Object.keys(handler.games[data.code].students));
  //   }
  // });

  // socket.on('buzz', function(data){
  //   handler.games[data.code].owner.emit('buzzed-in', {username:data.username, time: data.time});
  // });

  // socket.on('newQ', function(data){
  //   if (!handler.games[data.code]) socket.emit('error');
  //   else jeopardy.getQ(function(ques){
  //     handler.games[data.code].owner.emit('asked-question', ques);
  //     delete ques.answer;
  //     for(var student in handler.games[data.code].students){
  //       handler.games[data.code].students[student].emit('ask-question', ques);
  //     }
  //   });
  // });
  // socket.on('disconnect', function (){

    

  //   console.log(socket.conn.id, 'client about to disconnect')
  //   var i = allClients.indexOf(socket);
  //   allClients.splice(i, 1)
  //   var j = allsocketIds.indexOf(socket.conn.id)
  //   allsocketIds.splice(j, 1);
  //   console.log('these are all clients after disconnect: ', allClients);
  //   console.log('these are all ids after disconnect: ,', allsocketIds)
  // })

  // socket.on('error', function (err){
  //   console.log('error: ', err)
  // })
});

//--------------------------------
// END WEBSOCKETS
//--------------------------------
