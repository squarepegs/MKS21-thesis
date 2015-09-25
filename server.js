var bodyParser  = require('body-parser');
var express     = require('express');
var app = express();
var http = require('http');
// var server = require('http').createServer(app);
var morgan      = require('morgan');
var handler     = require('./server/requestHandler.js');

var PORT = process.env.PORT || 8000;





app.use(bodyParser.json());
app.use('/client',express.static(__dirname + '/client'));
// app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(morgan('dev'));

app.get('/test', function(req, res) {
    handler.doSomething(req, res);
  }
);

console.log('App is listening on port ' + PORT);
var server = app.listen(PORT);
var io = require('socket.io').listen(server)

module.exports = app;

//--------------------------------
// WEBSOCKETS -- Everything that requires Websockets lives INSIDE this callback.
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