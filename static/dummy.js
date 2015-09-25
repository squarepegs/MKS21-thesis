var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('studentView.html');
});

//server side socket connection will need updating for routers: event name is 'buzz'
io.on('connection', function (socket){
 socket.on('buzz', function (data){
 	console.log('this is the server data: '+data.toLowerCase());
  io.emit('buzz', data.toLowerCase());
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});