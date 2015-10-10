var bodyParser   = require('body-parser');
var express      = require('express');
var morgan       = require('morgan');
var handler      = require('./server/requestHandler.js');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var mongoose     = require('mongoose');
var jeopardy     = require('./server/jService.js');
var passport     = require('passport');
var flash        = require('connect-flash');
var helpers      = require('./config/helpers');
var MongoStore   = require('connect-mongo')(session);

var app = express();
var http         = require('http').Server(app);
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
                store: new MongoStore({ mongooseConnection: mongoose.connection,
                                        ttl: 1 * 24 * 60 * 60   
                                      })}));

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


http.listen(PORT, function (){
  console.log('Server is listening on port ' + PORT);

});

module.exports = app;

// --------------------------------
// WEBSOCKETS
// --------------------------------

// Everything that requires Websockets lives INSIDE this callback.

var io = require('socket.io')(http);

io.on('connection', function (socket) {
  //server connections object of total clients
  var clients = io.sockets.connected;
  console.log(socket.id, 'connected to the server')

  //TEACHER NEW GAME reated by server, only teachers can create new rooms: 
  socket.on('new game', function (user, deckID){
    //a teacher can host several rooms
  

    deckID = deckID || 'jService' // if user does not provide a deck, use the jService. 

    var hostRooms = clients[socket.id].rooms;

    //userid added to the socket
    socket.username = user.id;
    //user is marked as a HOST

    socket.teacher = true;

    //request handler creates room code
    var room = handler.gameMaker(user);

    console.log(socket.id, 'created a new game');

    //checks if teacher is in room, if it is socket leaves saved room, and joins new room created by server

    if(socket.code){
    console.log('this should only appear if ', socket.id, 'is already in a room on new game')
        socket.leave(socket.code);
        socket.join(room);  
    } else {

    //if it isn't in a room, the  new room saved in socket.code  
    socket.code = room;

    //teacher socket joins new room
    socket.join(socket.code); 

    }

    console.log('the teacher ', user.id, 'with ', socket.id, ' should be in these rooms before a new game', socket.rooms)

    console.log('this is the code sent to teacher', socket.code)
    console.log('this is the deck the teacher is using', deckID)
    //server emits welcome message and room code
    io.to(socket.id).emit('welcome message', socket.code, deckID);

  });

  //STUDENT JOIN ROOM LISTENER

  socket.on('student join', function (user){
  	console.log('this is the data from the student', user)
    //socket code assigned
    socket.code = user.code;


    //userid added to socket
    socket.username = user.id

    
    //student is not marked as a host;
    socket.teacher = false;

    //handler finds the host socket of the room by entering the student's code;

    var host = handler.findHost(clients, socket.code);


    console.log('the student', user.id, 'with ', socket.id, ' should be in these rooms before a new game', socket.rooms)

    console.log('this', socket.code,' will be the new room ', socket.username, 'will join')
    
    //if the room matches the teacher, then the student can join the room
    console.log('this is the host', host.username)
    console.log('this is the host code', socket.code,'this is the socket code', socket.code)
    if(host.code === socket.code){
    //save room in student's socket
    socket.code = user.code;
    
    //student now joins room
    socket.join(socket.code);

    //server sends username to host
    io.to(host.id).emit('student joined', socket.username);
    //server sends hostname to socket
    io.to(socket.id).emit('student joined', host.username);

    console.log('server sent student join to host socket', host.username)

    //other wise, there is an error and the student may not join the room.
    } 

  });


  //CHAMGE ROOMS LISTENER for stdnt and teacher

  socket.on('join room', function (oldRoom){
    
    console.log('the client', socket.id,' should be in these rooms before change', socket.rooms)
    
    
    //client joins the new room
    socket.code = oldRoom;
    
    socket.join(oldRoom);
    
    //server sends room code back to client
    io.to(socket.id).emit('room code', socket.code)

    
    //logging the state of each client at room change

    for(var client in clients){

    console.log('when ', socket.id, 'changed rooms; this ', client, ' has these rooms ', clients[client].rooms)
    
    };

  });

  //END GAME for teacher, teacher leaves room and students leave room.

  socket.on('end game', function (room){  
    //server checks to see that socket is a teacher
    var hostRooms = clients[socket.id].rooms;
    if(socket.teacher === true){     
      if(hostRooms.indexOf(room) !== -1){

        for(var client in clients){

          console.log('this host ', socket.id, 'has these rooms before closing the room', hostRooms)

          console.log('this client', client, ' has these rooms before closing the room', hostRooms)
          
            
            clients[client].disconnect();
            handler.endGame(room);
        };
      } else {
        io.emit('error');
      }
    } else {
      io.emit('error');
    }
  });

  //NEW QUESTION LISTENER for teacher, functionality remains as before. Not sure how 'ques' is passed.

  socket.on('newQ', function (room, deckID){

    console.log('in newQ these are the rooms', socket.rooms, 'that', socket.username, 'is in when sending the questions')
    console.log('and the question comes from ', deckID);
    console.log('and ', socket.username, 'sent this room to the server', room)
    
    //checks to see that the room exists
    if (socket.rooms.indexOf(room) !== -1){ 
      //callback to get question, not messing with this on change.
       console.log(socket.username,'should have a room', socket.code, 'that should be ', room)

         jeopardy.getJService(deckID, function (ques){
          console.log("jeopardy.getJService runs", ques)
          io.to(socket.id).emit('teacher question', ques);
          //delete ques.answer;
          //goes through the clients in the server   
          io.to(socket.code).emit('student question', ques)
        });


    }
  });

  //BUZZ LISTENR FOR STUDENT and TEACHER
  socket.on('buzz', function (data){

    io.to(socket.code).emit('buzzed in', {'id': socket.username, time: data.time});

  });

  socket.on('disconnect', function (){

    io.to(socket.code).emit('user disconnected', socket.username);

    console.log(socket.username, ' has disconnected from the server')
  });

  socket.on('error', function (err){
    console.log('this is the error: ', err);
  });

});

//--------------------------------
// END WEBSOCKETS
// //--------------------------------
