var bodyParser   = require('body-parser');
var express      = require('express');
var router       = express.Router();
var morgan       = require('morgan');
var mongoose     = require('mongoose');
var handler      = require('./requestHandler.js');
var http 			   = require('http');
var io           = require('socket.io');
//for accessing jeopardy API:
var jeopardy     = require('./jService.js');

var passport     = require('passport');
var app = express();

require('./middleware.js')(app, express);
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/learngage');


app.use(bodyParser.json());

app.use('/', express.static(__dirname, '/client'))
app.use('/client',express.static(__dirname + '/client'));
app.use(morgan('dev'));

app.use('/teacher', express.static(__dirname + '/client/teacher'));
app.use('/student', express.static(__dirname + '/client/student'));
app.use('/modules', express.static(__dirname + '/node_modules'));
app.use('/materialize', express.static(__dirname+ '/node_modules/materialize-css/'));

app.use('/', express.static(__dirname + '/client/landing_page'));

//var routes       = require('../config/routes')(app, passport);

// export our app for testing and flexibility, required by index.js

module.exports = app;
