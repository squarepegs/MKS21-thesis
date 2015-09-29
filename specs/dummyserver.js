//express server set up

//sockets listening set up


var io = require('socket.io').listen(5000);

var clients = {};

console.log('App is listening on port ' + 5000);

io.sockets.on('connection', function (socket){
	var userName;
	socket.on('connection name', function (user){
		userName = user.name;
		console.log('this user has joined : ', userName)
		clients[user.name] = socket;
		io.sockets.emit('new user', userName + " has joined")
	});

	socket.on('message', function (msg){
		io.sockets.emit('message', msg);
	});

	socket.on('private message', function (msg){
		fromMessage = {from:userName, txt:msg.text}
		clients[msg.to].emit('private message', fromMessage);
	})

	socket.on('disconnect', function (){
		delete clients[userName]
	})

});