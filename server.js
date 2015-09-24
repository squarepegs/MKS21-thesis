var bodyParser  = require('body-parser');
var express     = require('express');
var	morgan      = require('morgan');
var	handler     = require('./server/requestHandler.js');

var app = express();
var PORT = 8000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));
// app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(morgan('dev'));

app.get('/test',
	function(req, res){
		handler.doSomething(req, res);
	}
);

console.log('App is listening on port ' + PORT);
app.listen(PORT);
