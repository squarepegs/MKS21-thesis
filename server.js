var bodyParser  = require('body-parser');
var express     = require('express');
var app = express();
var http = require('http');
// var server = require('http').createServer(app);
var morgan      = require('morgan');
var handler     = require('./server/requestHandler.js');

// process.env.PORT is provided by the deployment server -- if we're running localhost, use 8000; 
var PORT = process.env.PORT || 8000;





app.use(bodyParser.json());


// Everything in the /client directory and subdirectories will be served at [hostname]/client.
// As of now, there is no route to '/' so don't worry if you get a "cannot GET" error at Localhost:8000
app.use('/client',express.static(__dirname + '/client'));
app.use(morgan('dev'));

app.get('/test', function(req, res) {
    handler.doSomething(req, res);
  }
);

console.log('App is listening on port ' + PORT);
// We require socket.io to have the entire server passed in as an argument, 
// so we create a server variable to pass into socket.io's .listen method. 
var server = app.listen(PORT);
var io = require('socket.io').listen(server)

module.exports = app;

//--------------------------------
// WEBSOCKETS
//--------------------------------

//Everything that requires Websockets lives INSIDE this callback.
io.sockets.on('connection', function(socket) {

  socket.on('buzz', function(studentBuzzer) {
    console.log("ServerSide Student: ", studentBuzzer.name, "Room: ", studentBuzzer.room, "Timestamp:", studentBuzzer.timestamp)
    io.emit('buzzResponse', ('buzzResponse recieved from server after ' + studentBuzzer.name + ' hit the buzzer at ' + studentBuzzer.timestamp + ' in ' + studentBuzzer.room))
  }); // end chat message



});

//--------------------------------
// END WEBSOCKETS
//--------------------------------