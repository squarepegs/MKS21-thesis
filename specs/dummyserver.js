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
	// socket.on('code', function (code){
	// 	io.sockets.emit('code', code)
	// })
	socket.on('code', function (code){
		io.sockets.emit('code', code);
	});

	socket.on('private code', function (code){
		fromCode = {from:userName, txt:code.text}
		clients[code.to].emit('private code', fromCode);
	})

	socket.on('disconnect', function (){
		delete clients[userName]
	})

});